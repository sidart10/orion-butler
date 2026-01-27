#!/usr/bin/env node
/**
 * SDK Runner - Node.js Sidecar Process
 * Story 2.3: query() Wrapper Implementation
 *
 * This script runs the Claude Agent SDK and communicates with
 * the Rust backend via JSON-line protocol over stdin/stdout.
 *
 * Protocol:
 * - Input: JSON commands from stdin (one per line)
 * - Output: JSON events to stdout (one per line)
 * - Errors: Written to stderr (for logging)
 *
 * Commands:
 * - { type: "query", id: string, prompt: string, options: {...} }
 * - { type: "interrupt", id: string }
 * - { type: "ping" }
 *
 * Events:
 * - { type: "text", id: string, content: string, isPartial: boolean }
 * - { type: "thinking", id: string, content: string, isPartial: boolean }
 * - { type: "tool_start", id: string, toolId: string, name: string, input: unknown }
 * - { type: "tool_complete", id: string, toolId: string, result: unknown, durationMs: number }
 * - { type: "complete", id: string, sessionId: string, costUsd: number, tokenCount: number, durationMs: number }
 * - { type: "error", id: string, code: string, message: string, recoverable: boolean }
 * - { type: "pong" }
 */

import { query } from '@anthropic-ai/claude-agent-sdk';
import readline from 'readline';

// =============================================================================
// Startup Validation
// =============================================================================

// Validate API key on startup
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('[sdk-runner] WARNING: ANTHROPIC_API_KEY not set');
  // Don't exit - wait for commands and return errors
}

// =============================================================================
// Active Queries Management
// =============================================================================

/** Active query generators indexed by request ID */
const activeQueries = new Map();

// =============================================================================
// Output Helpers
// =============================================================================

/**
 * Send JSON event to stdout
 */
function emit(event) {
  console.log(JSON.stringify(event));
}

/**
 * Log to stderr (doesn't interfere with protocol)
 */
function log(message) {
  console.error(`[sdk-runner] ${message}`);
}

// =============================================================================
// SDK Message Processing
// =============================================================================

/**
 * Process SDK message and emit appropriate events
 *
 * NOTE: The SDK emits both stream_event (partial deltas) AND assistant (complete message).
 * We emit text/thinking from stream_event only to avoid duplication.
 * Tool uses come from assistant messages since they're not streamed.
 */
function processSdkMessage(id, message, startTime) {
  switch (message.type) {
    case 'assistant':
      // Process content blocks in assistant message
      // IMPORTANT: Only emit tool_use here - text/thinking are already streamed via stream_event
      if (message.message?.content) {
        for (const block of message.message.content) {
          if (block.type === 'tool_use') {
            emit({
              type: 'tool_start',
              id,
              toolId: block.id,
              name: block.name,
              input: block.input,
            });
          }
          // Skip text and thinking blocks - they were already emitted via stream_event deltas
        }
      }
      break;

    case 'stream_event':
      // Handle partial/streaming events
      const event = message.event;
      if (event?.type === 'content_block_delta') {
        const delta = event.delta;
        if (delta?.type === 'text_delta') {
          emit({
            type: 'text',
            id,
            content: delta.text,
            isPartial: true,
          });
        } else if (delta?.type === 'thinking_delta') {
          emit({
            type: 'thinking',
            id,
            content: delta.thinking,
            isPartial: true,
          });
        }
      }
      break;

    case 'tool_progress':
      // Tool is still running
      break;

    case 'result':
      // Query complete
      const durationMs = Math.round(performance.now() - startTime);

      if (message.subtype === 'success') {
        emit({
          type: 'complete',
          id,
          sessionId: message.session_id,
          costUsd: message.total_cost_usd,
          tokenCount: message.usage?.input_tokens + message.usage?.output_tokens || 0,
          durationMs,
        });
      } else {
        // Error result
        emit({
          type: 'error',
          id,
          code: getErrorCode(message.subtype),
          message: message.errors?.join('; ') || `Query failed: ${message.subtype}`,
          recoverable: isRecoverable(message.subtype),
        });
      }
      break;

    case 'system':
      // Init, status, hook responses - mostly for logging
      if (message.subtype === 'init') {
        log(`SDK initialized: model=${message.model}, tools=${message.tools?.length}`);
      }
      break;

    case 'auth_status':
      if (message.error) {
        emit({
          type: 'error',
          id,
          code: '2001', // AUTH_REQUIRED
          message: message.error,
          recoverable: false,
        });
      }
      break;

    default:
      // Log unknown message types
      log(`Unknown message type: ${message.type}`);
  }
}

/**
 * Map SDK error subtype to Orion error code
 */
function getErrorCode(subtype) {
  switch (subtype) {
    case 'error_max_budget_usd':
      return '3003'; // BUDGET_EXCEEDED
    case 'error_max_turns':
      return '1001'; // SDK_ERROR
    case 'error_during_execution':
      return '1001'; // SDK_ERROR
    default:
      return '9001'; // FATAL_ERROR
  }
}

/**
 * Check if error is recoverable
 */
function isRecoverable(subtype) {
  return subtype === 'error_max_turns';
}

// =============================================================================
// Command Handlers
// =============================================================================

/**
 * Handle query command
 */
async function handleQuery(command) {
  const { id, prompt, options = {} } = command;
  const startTime = performance.now();

  try {
    // Create SDK options
    const sdkOptions = {
      model: options.model || 'claude-sonnet-4-5-20250929',
      includePartialMessages: true,
      maxTurns: options.maxTurns,
      maxBudgetUsd: options.maxBudgetUsd,
      maxThinkingTokens: options.maxThinkingTokens,
    };

    // Add session resume if provided
    if (options.sessionId) {
      if (options.forkSession) {
        sdkOptions.resume = options.sessionId;
        sdkOptions.forkSession = true;
      } else {
        sdkOptions.resume = options.sessionId;
      }
    }

    // Add permission mode
    if (options.permissionMode) {
      sdkOptions.permissionMode = options.permissionMode;
    }

    // System prompt
    if (options.systemPrompt) {
      sdkOptions.systemPrompt = options.systemPrompt;
    } else {
      // Use Claude Code system prompt with Orion append
      sdkOptions.systemPrompt = {
        type: 'preset',
        preset: 'claude_code',
        append: 'You are Orion Butler, a personal AI assistant.',
      };
    }

    // Create query
    const q = query({ prompt, options: sdkOptions });
    activeQueries.set(id, q);

    // Process messages
    for await (const message of q) {
      processSdkMessage(id, message, startTime);
    }

    activeQueries.delete(id);
  } catch (error) {
    emit({
      type: 'error',
      id,
      code: detectErrorCode(error),
      message: error.message || String(error),
      recoverable: isNetworkOrRateLimit(error),
    });
    activeQueries.delete(id);
  }
}

/**
 * Handle interrupt command
 */
async function handleInterrupt(command) {
  const { id } = command;
  const q = activeQueries.get(id);

  if (q && typeof q.interrupt === 'function') {
    try {
      await q.interrupt();
      log(`Interrupted query ${id}`);
    } catch (error) {
      log(`Error interrupting query ${id}: ${error.message}`);
    }
  } else {
    log(`No active query with id ${id} to interrupt`);
  }
}

/**
 * Detect error code from error
 */
function detectErrorCode(error) {
  const msg = error.message?.toLowerCase() || '';

  if (msg.includes('rate limit') || msg.includes('429')) {
    return '3001'; // RATE_LIMITED
  }
  if (msg.includes('authentication') || msg.includes('401')) {
    return '2001'; // AUTH_REQUIRED
  }
  if (msg.includes('network') || msg.includes('econnrefused')) {
    return '1002'; // NETWORK_ERROR
  }
  if (msg.includes('timeout')) {
    return '1003'; // TIMEOUT_ERROR
  }
  if (msg.includes('not found') || msg.includes('enoent')) {
    return '9002'; // CLI_NOT_FOUND
  }

  return '1001'; // SDK_ERROR
}

/**
 * Check if error is network or rate limit related
 */
function isNetworkOrRateLimit(error) {
  const msg = error.message?.toLowerCase() || '';
  return (
    msg.includes('network') ||
    msg.includes('rate limit') ||
    msg.includes('timeout') ||
    msg.includes('econnrefused')
  );
}

// =============================================================================
// Main Loop
// =============================================================================

/**
 * Process a single command
 */
async function processCommand(line) {
  try {
    const command = JSON.parse(line);

    switch (command.type) {
      case 'query':
        // Run query async (don't block input loop)
        handleQuery(command).catch((err) => {
          log(`Unhandled query error: ${err.message}`);
        });
        break;

      case 'interrupt':
        await handleInterrupt(command);
        break;

      case 'ping':
        emit({ type: 'pong' });
        break;

      default:
        log(`Unknown command type: ${command.type}`);
    }
  } catch (error) {
    log(`Error parsing command: ${error.message}`);
  }
}

/**
 * Main entry point
 */
function main() {
  log('SDK runner started');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  rl.on('line', (line) => {
    if (line.trim()) {
      processCommand(line);
    }
  });

  rl.on('close', () => {
    log('SDK runner shutting down');
    process.exit(0);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    log('Received SIGTERM, shutting down');
    rl.close();
  });

  process.on('SIGINT', () => {
    log('Received SIGINT, shutting down');
    rl.close();
  });
}

main();
