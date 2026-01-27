/**
 * useChat Composition Hook
 * Story 2.5/2.6: Chat State Management
 *
 * High-level composition hook that combines:
 * - useStreamingMachine for state management
 * - useBufferedStreamListener for smooth rendering
 * - Latency tracking for NFR-1.1 / NFR-7.1
 *
 * This is the primary hook for chat UI components.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useStreamingMachine } from './useStreamingMachine';
import { useBufferedTextStream } from './useBufferedStreamListener';
import type { ChatQueryOptions } from '@/lib/ipc/chat';

// =============================================================================
// Types
// =============================================================================

export interface LatencyMetrics {
  /** Time to first token in ms (NFR-1.1: <2s target) */
  firstTokenMs: number | null;
  /** Total response duration in ms */
  totalDurationMs: number | null;
  /** Request start timestamp */
  startTime: number | null;
}

export interface UseChatOptions {
  /** Default query options */
  defaultOptions?: ChatQueryOptions;
  /** Callback when budget warning is triggered */
  onBudgetWarning?: (currentCost: number, maxBudget: number) => void;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
  /** Callback when response completes */
  onComplete?: (metrics: LatencyMetrics) => void;
  /** Enable text buffering for smoother rendering */
  bufferText?: boolean;
}

export interface UseChatReturn {
  /** All messages in the conversation */
  messages: ReturnType<typeof useStreamingMachine>['messages'];
  /** Current state: idle, sending, streaming, complete, error */
  state: string;
  /** Whether currently streaming */
  isStreaming: boolean;
  /** Whether sending a message */
  isSending: boolean;
  /** Current error if any */
  error: Error | null;
  /** Active tool uses */
  toolUses: ReturnType<typeof useStreamingMachine>['toolUses'];
  /** Session info after completion */
  session: ReturnType<typeof useStreamingMachine>['session'];
  /** Budget warning triggered */
  budgetWarning: boolean;
  /** Current thinking content */
  thinking: string;
  /** Latency metrics */
  latency: LatencyMetrics;
  /** Buffered current message (for smooth rendering) */
  currentMessageBuffered: string;
  /** Send a message */
  sendMessage: (prompt: string, options?: ChatQueryOptions) => Promise<void>;
  /** Cancel current request */
  cancel: () => Promise<void>;
  /** Retry after error */
  retry: () => void;
  /** Reset conversation */
  reset: () => void;
  /** Clear error */
  clearError: () => void;
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Main chat hook - combines state machine with buffering and metrics
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    defaultOptions,
    onBudgetWarning,
    onError,
    onComplete,
    bufferText = true,
  } = options;

  // Core streaming machine
  const machine = useStreamingMachine();

  // Latency tracking state
  const [latency, setLatency] = useState<LatencyMetrics>({
    firstTokenMs: null,
    totalDurationMs: null,
    startTime: null,
  });

  // Refs for tracking
  const startTimeRef = useRef<number | null>(null);
  const firstTokenReceivedRef = useRef<boolean>(false);

  // Buffered message state (for smooth rendering)
  const [bufferedMessage, setBufferedMessage] = useState('');

  // Text buffer hook
  const textBuffer = useBufferedTextStream(
    useCallback((text) => {
      setBufferedMessage((prev) => prev + text);
    }, []),
    { enabled: bufferText }
  );

  // Track state transitions for latency measurement
  const prevStateRef = useRef<string>(machine.stateValue);

  useEffect(() => {
    const prevState = prevStateRef.current;
    const currentState = machine.stateValue;
    prevStateRef.current = currentState;

    // Sending started
    if (prevState !== 'sending' && currentState === 'sending') {
      const now = performance.now();
      startTimeRef.current = now;
      firstTokenReceivedRef.current = false;
      setLatency({
        firstTokenMs: null,
        totalDurationMs: null,
        startTime: now,
      });
      setBufferedMessage('');
      textBuffer.clear();
    }

    // Streaming started (first token received)
    if (prevState === 'sending' && currentState === 'streaming') {
      if (!firstTokenReceivedRef.current && startTimeRef.current) {
        const firstTokenMs = performance.now() - startTimeRef.current;
        firstTokenReceivedRef.current = true;
        setLatency((prev) => ({
          ...prev,
          firstTokenMs,
        }));

        // Log if exceeds NFR-1.1 target (<2s)
        if (firstTokenMs > 2000) {
          console.warn(
            `[useChat] First token latency ${firstTokenMs.toFixed(0)}ms exceeds NFR-1.1 target of 2000ms`
          );
        }
      }
    }

    // Completed
    if (prevState === 'streaming' && currentState === 'complete') {
      if (startTimeRef.current) {
        const totalDurationMs = performance.now() - startTimeRef.current;
        setLatency((prev) => ({
          ...prev,
          totalDurationMs,
        }));

        onComplete?.({
          firstTokenMs: latency.firstTokenMs,
          totalDurationMs,
          startTime: latency.startTime,
        });
      }
      textBuffer.flush();
    }
  }, [machine.stateValue, latency.firstTokenMs, latency.startTime, onComplete, textBuffer]);

  // Handle budget warning
  useEffect(() => {
    if (machine.budgetWarning && machine.session) {
      onBudgetWarning?.(machine.session.costUsd, machine.session.costUsd);
    }
  }, [machine.budgetWarning, machine.session, onBudgetWarning]);

  // Handle error
  useEffect(() => {
    if (machine.error) {
      onError?.(machine.error);
    }
  }, [machine.error, onError]);

  // Buffer text chunks from messages
  useEffect(() => {
    const lastMessage = machine.messages[machine.messages.length - 1];
    if (lastMessage?.role === 'assistant' && lastMessage.isStreaming) {
      // The machine already accumulates content, but we can use the buffer
      // for additional smoothing if needed
    }
  }, [machine.messages]);

  // Send message with merged options
  const sendMessage = useCallback(
    async (prompt: string, messageOptions?: ChatQueryOptions) => {
      const mergedOptions = {
        ...defaultOptions,
        ...messageOptions,
      };
      await machine.send(prompt, mergedOptions);
    },
    [defaultOptions, machine]
  );

  // Clear error helper
  const clearError = useCallback(() => {
    // Error is cleared on retry or reset
    machine.retry();
  }, [machine]);

  return {
    messages: machine.messages,
    state: machine.stateValue,
    isStreaming: machine.isStreaming,
    isSending: machine.isSending,
    error: machine.error,
    toolUses: machine.toolUses,
    session: machine.session,
    budgetWarning: machine.budgetWarning,
    thinking: machine.currentThinking,
    latency,
    currentMessageBuffered: bufferedMessage,
    sendMessage,
    cancel: machine.cancel,
    retry: machine.retry,
    reset: machine.reset,
    clearError,
  };
}

// =============================================================================
// Utility Hooks
// =============================================================================

/**
 * Track and report latency metrics
 */
export function useLatencyReporter(metrics: LatencyMetrics) {
  useEffect(() => {
    if (metrics.firstTokenMs !== null && metrics.totalDurationMs !== null) {
      // Could report to analytics here
      console.log(
        `[Latency] TTFT: ${metrics.firstTokenMs.toFixed(0)}ms, Total: ${metrics.totalDurationMs.toFixed(0)}ms`
      );
    }
  }, [metrics.firstTokenMs, metrics.totalDurationMs]);
}

/**
 * Simple hook for just sending messages without all the extras
 */
export function useChatSimple() {
  const chat = useChat({ bufferText: false });

  return {
    send: chat.sendMessage,
    messages: chat.messages,
    isLoading: chat.isSending || chat.isStreaming,
    error: chat.error,
  };
}
