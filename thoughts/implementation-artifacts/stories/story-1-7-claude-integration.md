# Story 1.7: Claude Integration

Status: ready-for-dev

---

## Story

As a user,
I want to chat with Claude through Orion,
So that I can get AI assistance for my daily tasks.

---

## Acceptance Criteria

1. **AC1: Basic Message Round-Trip**
   - **Given** I have entered my Anthropic API key (or it's configured in environment)
   - **When** I send a message through the chat interface
   - **Then** the message is sent to Claude API via the Agent Server
   - **And** Claude's response is received and displayed in the chat
   - **And** both user message and assistant response are persisted to the database

2. **AC2: Conversation Context Maintenance**
   - **Given** I have an active conversation with multiple messages
   - **When** I send a new message
   - **Then** the previous conversation context is included in the API call
   - **And** Claude's response demonstrates awareness of the conversation history
   - **And** the SDK session ID is stored in the conversation record

3. **AC3: Invalid API Key Handling**
   - **Given** the API key is invalid, missing, or malformed
   - **When** I try to send a message
   - **Then** I see a clear error message explaining the issue (401/authentication error)
   - **And** I'm prompted to enter/fix my API key
   - **And** the error state is recoverable without app restart

4. **AC4: API Key Validation**
   - **Given** I'm entering an Anthropic API key
   - **When** the key is submitted
   - **Then** malformed keys (wrong prefix, wrong length) are rejected locally
   - **And** valid-format keys are validated against the API with a test call
   - **And** validation result is displayed within 3 seconds

5. **AC5: Network Error Handling**
   - **Given** Claude API returns a network error or times out
   - **When** the error occurs
   - **Then** the error is displayed in a user-friendly format
   - **And** I can retry the message without retyping
   - **And** partial responses (if any) are preserved

6. **AC6: Rate Limit Handling**
   - **Given** Claude API returns a 429 rate limit error
   - **When** the rate limit is hit
   - **Then** a user-friendly message explains the temporary limit
   - **And** retry-after timing is displayed if provided
   - **And** automatic retry is offered after the wait period

7. **AC7: Model Configuration**
   - **Given** the Agent Server is running
   - **When** Claude API calls are made
   - **Then** the configured model (claude-sonnet-4-5) is used
   - **And** model can be overridden via environment variable
   - **And** API calls include appropriate beta headers for structured outputs

8. **AC8: Token Usage Tracking**
   - **Given** a Claude API response is received
   - **When** the response is processed
   - **Then** input_tokens and output_tokens are extracted from the response
   - **And** token counts are stored in the message record
   - **And** total conversation tokens can be calculated

---

## Tasks / Subtasks

- [ ] **Task 1: API Key Management** (AC: 3, 4)
  - [ ] 1.1 Create `agent-server/src/config/api-keys.ts`:
    ```typescript
    // agent-server/src/config/api-keys.ts

    import Anthropic from '@anthropic-ai/sdk';

    // Anthropic API key format validation
    const ANTHROPIC_KEY_PATTERN = /^sk-ant-[a-zA-Z0-9-_]{40,}$/;

    export interface ApiKeyValidationResult {
      valid: boolean;
      error?: string;
      models?: string[];  // Available models if valid
    }

    export function validateApiKeyFormat(apiKey: string): { valid: boolean; error?: string } {
      if (!apiKey || apiKey.trim() === '') {
        return { valid: false, error: 'API key is required' };
      }

      if (!apiKey.startsWith('sk-ant-')) {
        return { valid: false, error: 'Invalid API key format: must start with "sk-ant-"' };
      }

      if (!ANTHROPIC_KEY_PATTERN.test(apiKey)) {
        return { valid: false, error: 'Invalid API key format: incorrect length or characters' };
      }

      return { valid: true };
    }

    export async function validateApiKeyWithApi(apiKey: string): Promise<ApiKeyValidationResult> {
      // First, validate format
      const formatCheck = validateApiKeyFormat(apiKey);
      if (!formatCheck.valid) {
        return { valid: false, error: formatCheck.error };
      }

      // Then, validate with a minimal API call
      const client = new Anthropic({ apiKey });

      try {
        // Use a minimal message to test authentication
        const response = await client.messages.create({
          model: 'claude-sonnet-4-5-20250514',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hello' }],
        });

        return { valid: true, models: ['claude-sonnet-4-5'] };
      } catch (error: any) {
        if (error.status === 401) {
          return { valid: false, error: 'Invalid API key: authentication failed' };
        }
        if (error.status === 403) {
          return { valid: false, error: 'API key does not have permission for this model' };
        }
        throw error; // Re-throw unexpected errors
      }
    }

    export function getApiKey(): string {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY environment variable is not set');
      }
      return apiKey;
    }
    ```
  - [ ] 1.2 Create API key validation endpoint in Agent Server
  - [ ] 1.3 Add secure API key storage (environment variable initially, keychain later)
  - [ ] 1.4 Create frontend API key entry component with validation feedback

- [ ] **Task 2: Claude Client Setup** (AC: 1, 7, 8)
  - [ ] 2.1 Create `agent-server/src/services/claude-client.ts`:
    ```typescript
    // agent-server/src/services/claude-client.ts

    import Anthropic from '@anthropic-ai/sdk';
    import type { Message, MessageCreateParams, ContentBlock } from '@anthropic-ai/sdk/resources/messages';

    export interface ClaudeClientConfig {
      apiKey: string;
      model?: string;
      maxTokens?: number;
    }

    export interface ConversationMessage {
      role: 'user' | 'assistant';
      content: string;
    }

    export interface ClaudeResponse {
      content: string;
      inputTokens: number;
      outputTokens: number;
      stopReason: string;
      model: string;
    }

    export class ClaudeClient {
      private client: Anthropic;
      private model: string;
      private maxTokens: number;

      constructor(config: ClaudeClientConfig) {
        this.client = new Anthropic({ apiKey: config.apiKey });
        this.model = config.model || process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250514';
        this.maxTokens = config.maxTokens || 4096;
      }

      async sendMessage(
        userMessage: string,
        conversationHistory: ConversationMessage[] = [],
        systemPrompt?: string,
      ): Promise<ClaudeResponse> {
        // Build messages array with history
        const messages: MessageCreateParams['messages'] = conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

        // Add current user message
        messages.push({ role: 'user', content: userMessage });

        const params: MessageCreateParams = {
          model: this.model,
          max_tokens: this.maxTokens,
          messages,
        };

        // Add system prompt if provided
        if (systemPrompt) {
          params.system = systemPrompt;
        }

        const response = await this.client.messages.create(params, {
          headers: {
            // Include beta headers for structured outputs capability
            'anthropic-beta': 'structured-outputs-2025-11-13',
          },
        });

        // Extract text content from response
        const textContent = this.extractTextContent(response.content);

        return {
          content: textContent,
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          stopReason: response.stop_reason || 'unknown',
          model: response.model,
        };
      }

      private extractTextContent(content: ContentBlock[]): string {
        const textBlocks = content.filter(block => block.type === 'text');
        return textBlocks.map(block => (block as { type: 'text'; text: string }).text).join('\n');
      }

      getModel(): string {
        return this.model;
      }
    }

    // Singleton instance
    let clientInstance: ClaudeClient | null = null;

    export function getClaudeClient(config?: ClaudeClientConfig): ClaudeClient {
      if (!clientInstance && config) {
        clientInstance = new ClaudeClient(config);
      }
      if (!clientInstance) {
        throw new Error('Claude client not initialized. Call with config first.');
      }
      return clientInstance;
    }

    export function resetClaudeClient(): void {
      clientInstance = null;
    }
    ```
  - [ ] 2.2 Add model configuration via environment variable
  - [ ] 2.3 Implement token tracking extraction from API response
  - [ ] 2.4 Add beta headers for future structured outputs support

- [ ] **Task 3: Agent Server Chat Endpoint** (AC: 1, 2, 5, 6)
  - [ ] 3.1 Create `agent-server/src/routes/chat.ts`:
    ```typescript
    // agent-server/src/routes/chat.ts

    import { Router, Request, Response } from 'express';
    import { ClaudeClient, getClaudeClient, ConversationMessage } from '../services/claude-client';
    import { validateApiKeyFormat } from '../config/api-keys';

    const router = Router();

    interface ChatRequest {
      message: string;
      conversationId: string;
      history?: ConversationMessage[];
    }

    interface ChatResponse {
      content: string;
      inputTokens: number;
      outputTokens: number;
      model: string;
    }

    interface ErrorResponse {
      error: string;
      code: string;
      retryable: boolean;
      retryAfter?: number;
    }

    // POST /api/chat/message
    router.post('/message', async (req: Request, res: Response) => {
      try {
        const { message, conversationId, history = [] } = req.body as ChatRequest;

        if (!message || message.trim() === '') {
          return res.status(400).json({
            error: 'Message is required',
            code: 'INVALID_INPUT',
            retryable: false,
          } as ErrorResponse);
        }

        const client = getClaudeClient();

        // Butler system prompt for MVP
        const systemPrompt = `You are Orion, an AI-powered personal butler assistant. You help users manage their digital lives by assisting with email, calendar, tasks, and relationships.

Be helpful, concise, and proactive. Ask clarifying questions when needed. Remember context from the conversation.`;

        const response = await client.sendMessage(message, history, systemPrompt);

        return res.json({
          content: response.content,
          inputTokens: response.inputTokens,
          outputTokens: response.outputTokens,
          model: response.model,
        } as ChatResponse);

      } catch (error: any) {
        // Handle specific error types
        return handleClaudeError(error, res);
      }
    });

    // GET /api/chat/health
    router.get('/health', (req: Request, res: Response) => {
      const apiKeySet = !!process.env.ANTHROPIC_API_KEY;
      res.json({
        status: 'ok',
        apiKeyConfigured: apiKeySet,
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250514',
      });
    });

    // POST /api/chat/validate-key
    router.post('/validate-key', async (req: Request, res: Response) => {
      const { apiKey } = req.body;

      const formatResult = validateApiKeyFormat(apiKey);
      if (!formatResult.valid) {
        return res.json({ valid: false, error: formatResult.error });
      }

      // Optionally validate with API (can be expensive)
      // For MVP, just validate format
      return res.json({ valid: true });
    });

    function handleClaudeError(error: any, res: Response): Response {
      // Rate limit error
      if (error.status === 429) {
        const retryAfter = error.headers?.['retry-after'];
        return res.status(429).json({
          error: 'Rate limit exceeded. Please wait before sending more messages.',
          code: 'RATE_LIMITED',
          retryable: true,
          retryAfter: retryAfter ? parseInt(retryAfter) : 60,
        } as ErrorResponse);
      }

      // Authentication error
      if (error.status === 401) {
        return res.status(401).json({
          error: 'Invalid or missing API key. Please check your Anthropic API key.',
          code: 'AUTH_ERROR',
          retryable: false,
        } as ErrorResponse);
      }

      // Permission error
      if (error.status === 403) {
        return res.status(403).json({
          error: 'API key does not have permission for this operation.',
          code: 'PERMISSION_ERROR',
          retryable: false,
        } as ErrorResponse);
      }

      // Server error (Anthropic side)
      if (error.status >= 500) {
        return res.status(502).json({
          error: 'Claude API is temporarily unavailable. Please try again.',
          code: 'API_ERROR',
          retryable: true,
        } as ErrorResponse);
      }

      // Network error
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        return res.status(503).json({
          error: 'Unable to connect to Claude API. Check your internet connection.',
          code: 'NETWORK_ERROR',
          retryable: true,
        } as ErrorResponse);
      }

      // Unknown error
      console.error('Unexpected Claude API error:', error);
      return res.status(500).json({
        error: 'An unexpected error occurred. Please try again.',
        code: 'UNKNOWN_ERROR',
        retryable: true,
      } as ErrorResponse);
    }

    export default router;
    ```
  - [ ] 3.2 Register chat routes in main Express app
  - [ ] 3.3 Implement comprehensive error handling with error codes
  - [ ] 3.4 Add retry-after header parsing for rate limits
  - [ ] 3.5 Create health check endpoint for API key status

- [ ] **Task 4: Frontend Chat Service** (AC: 1, 2, 3, 5)
  - [ ] 4.1 Create `src/lib/services/chatService.ts`:
    ```typescript
    // src/lib/services/chatService.ts

    import { invoke } from '@tauri-apps/api/core';
    import type { Message, Conversation } from '@/lib/db/types';

    export interface ChatError {
      error: string;
      code: string;
      retryable: boolean;
      retryAfter?: number;
    }

    export interface SendMessageResult {
      success: boolean;
      message?: Message;
      error?: ChatError;
    }

    export interface AgentServerResponse {
      content: string;
      inputTokens: number;
      outputTokens: number;
      model: string;
    }

    export class ChatService {
      private baseUrl: string;

      constructor(baseUrl: string = 'http://localhost:3001') {
        this.baseUrl = baseUrl;
      }

      async sendMessage(
        conversationId: string,
        content: string,
        history: Array<{ role: 'user' | 'assistant'; content: string }>,
      ): Promise<SendMessageResult> {
        try {
          const response = await fetch(`${this.baseUrl}/api/chat/message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: content,
              conversationId,
              history,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json() as ChatError;
            return { success: false, error: errorData };
          }

          const data = await response.json() as AgentServerResponse;

          // Save assistant message via Tauri IPC
          const savedMessage = await invoke<Message>('save_assistant_message', {
            conversationId,
            content: data.content,
            inputTokens: data.inputTokens,
            outputTokens: data.outputTokens,
          });

          return { success: true, message: savedMessage };
        } catch (error) {
          // Network error
          return {
            success: false,
            error: {
              error: 'Failed to connect to agent server',
              code: 'CONNECTION_ERROR',
              retryable: true,
            },
          };
        }
      }

      async checkHealth(): Promise<{ healthy: boolean; apiKeyConfigured: boolean }> {
        try {
          const response = await fetch(`${this.baseUrl}/api/chat/health`);
          if (!response.ok) {
            return { healthy: false, apiKeyConfigured: false };
          }
          const data = await response.json();
          return {
            healthy: true,
            apiKeyConfigured: data.apiKeyConfigured,
          };
        } catch {
          return { healthy: false, apiKeyConfigured: false };
        }
      }

      async validateApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
        try {
          const response = await fetch(`${this.baseUrl}/api/chat/validate-key`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey }),
          });
          return await response.json();
        } catch {
          return { valid: false, error: 'Failed to validate API key' };
        }
      }
    }

    // Singleton instance
    export const chatService = new ChatService();
    ```
  - [ ] 4.2 Create typed response interfaces for API communication
  - [ ] 4.3 Implement error transformation for UI display
  - [ ] 4.4 Add health check polling on app startup

- [ ] **Task 5: Update Chat Store for Claude Integration** (AC: 1, 2, 5, 6)
  - [ ] 5.1 Extend `src/stores/chatStore.ts`:
    ```typescript
    // Extend existing chatStore.ts from Story 1.6

    import { create } from 'zustand';
    import { immer } from 'zustand/middleware/immer';
    import { chatCommands } from '@/lib/tauri/commands/chat';
    import { chatService, ChatError } from '@/lib/services/chatService';
    import type { Message, Conversation } from '@/lib/db/types';

    interface ChatState {
      // Existing state from Story 1.6
      conversations: Conversation[];
      activeConversationId: string | null;
      messages: Message[];
      isLoading: boolean;
      error: string | null;

      // New state for Claude integration
      isSending: boolean;
      sendError: ChatError | null;
      retryMessage: string | null;  // Store message for retry
      apiKeyConfigured: boolean;

      // Existing actions
      loadConversations: () => Promise<void>;
      selectConversation: (id: string) => Promise<void>;
      createNewConversation: () => Promise<Conversation>;

      // New actions for Claude integration
      sendMessage: (content: string) => Promise<void>;
      retrySend: () => Promise<void>;
      clearSendError: () => void;
      checkApiKeyStatus: () => Promise<void>;
    }

    export const useChatStore = create<ChatState>()(
      immer((set, get) => ({
        // ... existing state initialization ...

        isSending: false,
        sendError: null,
        retryMessage: null,
        apiKeyConfigured: false,

        sendMessage: async (content: string) => {
          const { activeConversationId, messages } = get();

          if (!activeConversationId) {
            // Create new conversation if none active
            const conv = await get().createNewConversation();
            set((state) => { state.activeConversationId = conv.id; });
          }

          set((state) => {
            state.isSending = true;
            state.sendError = null;
            state.retryMessage = null;
          });

          try {
            // Save user message first
            const userMessage = await chatCommands.sendMessage(
              get().activeConversationId!,
              content,
            );

            set((state) => {
              state.messages.push(userMessage);
            });

            // Build conversation history for Claude
            const history = get().messages
              .filter(m => m.role !== 'system')
              .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

            // Send to Claude via Agent Server
            const result = await chatService.sendMessage(
              get().activeConversationId!,
              content,
              history.slice(-20), // Last 20 messages for context
            );

            if (!result.success) {
              set((state) => {
                state.sendError = result.error!;
                state.retryMessage = content;
                state.isSending = false;
              });
              return;
            }

            // Add assistant message to state
            set((state) => {
              state.messages.push(result.message!);
              state.isSending = false;
            });

          } catch (error) {
            set((state) => {
              state.sendError = {
                error: 'An unexpected error occurred',
                code: 'UNKNOWN_ERROR',
                retryable: true,
              };
              state.retryMessage = content;
              state.isSending = false;
            });
          }
        },

        retrySend: async () => {
          const { retryMessage } = get();
          if (retryMessage) {
            await get().sendMessage(retryMessage);
          }
        },

        clearSendError: () => {
          set((state) => {
            state.sendError = null;
            state.retryMessage = null;
          });
        },

        checkApiKeyStatus: async () => {
          const health = await chatService.checkHealth();
          set((state) => {
            state.apiKeyConfigured = health.apiKeyConfigured;
          });
        },
      }))
    );
    ```
  - [ ] 5.2 Add send error state and retry capability
  - [ ] 5.3 Implement message history building for context
  - [ ] 5.4 Add API key status tracking

- [ ] **Task 6: Error Display Component** (AC: 3, 5, 6)
  - [ ] 6.1 Create `src/components/chat/ChatError.tsx`:
    ```typescript
    // src/components/chat/ChatError.tsx

    import { useChatStore } from '@/stores/chatStore';
    import { ChatError } from '@/lib/services/chatService';
    import { useEffect, useState } from 'react';

    interface ChatErrorDisplayProps {
      error: ChatError;
      onRetry?: () => void;
      onDismiss?: () => void;
    }

    export function ChatErrorDisplay({ error, onRetry, onDismiss }: ChatErrorDisplayProps) {
      const [countdown, setCountdown] = useState(error.retryAfter || 0);

      useEffect(() => {
        if (countdown > 0) {
          const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
          return () => clearTimeout(timer);
        }
      }, [countdown]);

      const getErrorIcon = () => {
        switch (error.code) {
          case 'AUTH_ERROR':
            return '🔑';
          case 'RATE_LIMITED':
            return '⏳';
          case 'NETWORK_ERROR':
            return '🌐';
          default:
            return '⚠️';
        }
      };

      const getActionButton = () => {
        if (error.code === 'AUTH_ERROR') {
          return (
            <button
              onClick={() => window.location.href = '/settings/api-key'}
              className="btn-gold-slide"
            >
              Configure API Key
            </button>
          );
        }

        if (error.retryable) {
          if (countdown > 0) {
            return (
              <button disabled className="btn opacity-50">
                Retry in {countdown}s
              </button>
            );
          }
          return (
            <button onClick={onRetry} className="btn-gold-slide">
              Retry
            </button>
          );
        }

        return null;
      };

      return (
        <div className="border border-red-500/20 bg-red-500/5 p-4 rounded-none">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{getErrorIcon()}</span>
            <div className="flex-1">
              <p className="font-medium text-orion-fg">{error.error}</p>
              {error.code && (
                <p className="text-xs text-orion-fg/50 mt-1">
                  Error code: {error.code}
                </p>
              )}
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-orion-fg/50 hover:text-orion-fg"
              >
                ×
              </button>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            {getActionButton()}
          </div>
        </div>
      );
    }
    ```
  - [ ] 6.2 Implement countdown timer for rate limit retry
  - [ ] 6.3 Add action buttons (retry, configure API key)
  - [ ] 6.4 Style with Orion Design System tokens

- [ ] **Task 7: API Key Entry UI** (AC: 3, 4)
  - [ ] 7.1 Create `src/components/settings/ApiKeyInput.tsx`:
    ```typescript
    // src/components/settings/ApiKeyInput.tsx

    import { useState } from 'react';
    import { chatService } from '@/lib/services/chatService';

    interface ApiKeyInputProps {
      onValidKey?: (key: string) => void;
    }

    export function ApiKeyInput({ onValidKey }: ApiKeyInputProps) {
      const [apiKey, setApiKey] = useState('');
      const [isValidating, setIsValidating] = useState(false);
      const [validationResult, setValidationResult] = useState<{
        valid: boolean;
        error?: string;
      } | null>(null);

      const handleValidate = async () => {
        setIsValidating(true);
        setValidationResult(null);

        const result = await chatService.validateApiKey(apiKey);
        setValidationResult(result);
        setIsValidating(false);

        if (result.valid && onValidKey) {
          onValidKey(apiKey);
        }
      };

      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-editorial text-orion-fg/60 mb-2">
              Anthropic API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="input-editorial w-full"
            />
          </div>

          {validationResult && (
            <div className={`text-sm ${validationResult.valid ? 'text-green-600' : 'text-red-600'}`}>
              {validationResult.valid ? '✓ API key is valid' : validationResult.error}
            </div>
          )}

          <button
            onClick={handleValidate}
            disabled={!apiKey || isValidating}
            className="btn-gold-slide w-full"
          >
            {isValidating ? 'Validating...' : 'Validate API Key'}
          </button>

          <p className="text-xs text-orion-fg/50">
            Get your API key from{' '}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orion-primary hover:underline"
            >
              Anthropic Console
            </a>
          </p>
        </div>
      );
    }
    ```
  - [ ] 7.2 Add password field with show/hide toggle
  - [ ] 7.3 Implement real-time format validation feedback
  - [ ] 7.4 Add link to Anthropic console for key generation

- [ ] **Task 8: Tauri IPC for Assistant Messages** (AC: 1, 8)
  - [ ] 8.1 Extend Rust commands in `src-tauri/src/commands/chat.rs`:
    ```rust
    // Add to existing src-tauri/src/commands/chat.rs

    use crate::db::{get_connection, messages, conversations};
    use serde::{Deserialize, Serialize};

    #[derive(Deserialize)]
    pub struct SaveAssistantMessageInput {
        conversation_id: String,
        content: String,
        tool_calls: Option<Vec<serde_json::Value>>,
        tool_results: Option<Vec<serde_json::Value>>,
        input_tokens: Option<i32>,
        output_tokens: Option<i32>,
    }

    #[tauri::command]
    pub async fn save_assistant_message(
        input: SaveAssistantMessageInput,
    ) -> Result<Message, String> {
        let conn = get_connection().map_err(|e| e.to_string())?;

        let id = generate_message_id();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO messages (id, conversation_id, role, content, tool_calls, tool_results, input_tokens, output_tokens, created_at)
             VALUES (?1, ?2, 'assistant', ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                id,
                input.conversation_id,
                input.content,
                input.tool_calls.map(|tc| serde_json::to_string(&tc).unwrap_or_default()),
                input.tool_results.map(|tr| serde_json::to_string(&tr).unwrap_or_default()),
                input.input_tokens,
                input.output_tokens,
                now,
            ],
        ).map_err(|e| e.to_string())?;

        // Update conversation stats
        conn.execute(
            "UPDATE conversations SET message_count = message_count + 1, last_message_at = ?1 WHERE id = ?2",
            params![now, input.conversation_id],
        ).map_err(|e| e.to_string())?;

        // Return the created message
        messages::get_message(&conn, &id).map_err(|e| e.to_string())
    }

    fn generate_message_id() -> String {
        use rand::Rng;
        let random: [u8; 8] = rand::thread_rng().gen();
        format!("msg_{}", base64::encode_config(&random, base64::URL_SAFE_NO_PAD))
    }
    ```
  - [ ] 8.2 Register command in Tauri plugin system
  - [ ] 8.3 Add token tracking fields to message save
  - [ ] 8.4 Update conversation stats on assistant message

- [ ] **Task 9: Chat Input Integration** (AC: 1)
  - [ ] 9.1 Update `src/components/chat/ChatInput.tsx`:
    ```typescript
    // src/components/chat/ChatInput.tsx

    import { useState, useRef, useEffect } from 'react';
    import { useChatStore } from '@/stores/chatStore';

    export function ChatInput() {
      const [input, setInput] = useState('');
      const textareaRef = useRef<HTMLTextAreaElement>(null);
      const { sendMessage, isSending, sendError, apiKeyConfigured } = useChatStore();

      const handleSubmit = async () => {
        if (!input.trim() || isSending) return;

        const message = input;
        setInput('');
        await sendMessage(message);
      };

      const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.metaKey) {
          e.preventDefault();
          handleSubmit();
        }
      };

      // Auto-resize textarea
      useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
          textarea.style.height = 'auto';
          textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        }
      }, [input]);

      if (!apiKeyConfigured) {
        return (
          <div className="p-4 border-t border-orion-fg/10">
            <p className="text-orion-fg/50 text-center">
              Please configure your API key to start chatting.
            </p>
          </div>
        );
      }

      return (
        <div className="p-4 border-t border-orion-fg/10">
          <div className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Orion... (Cmd+Enter to send)"
              className="flex-1 resize-none bg-transparent border border-orion-fg/10 p-3 focus:border-orion-primary focus:outline-none"
              rows={1}
              disabled={isSending}
              data-testid="chat-input"
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isSending}
              className="btn-gold-slide px-6 py-3"
              data-testid="send-button"
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
          {sendError && (
            <div className="mt-2">
              <ChatErrorDisplay
                error={sendError}
                onRetry={() => useChatStore.getState().retrySend()}
                onDismiss={() => useChatStore.getState().clearSendError()}
              />
            </div>
          )}
        </div>
      );
    }
    ```
  - [ ] 9.2 Add Cmd+Enter keyboard shortcut for send
  - [ ] 9.3 Integrate error display component
  - [ ] 9.4 Add disabled state during sending

- [ ] **Task 10: Agent Server Initialization** (AC: 7)
  - [ ] 10.1 Update `agent-server/src/index.ts`:
    ```typescript
    // agent-server/src/index.ts

    import express from 'express';
    import cors from 'cors';
    import chatRouter from './routes/chat';
    import { getClaudeClient } from './services/claude-client';
    import { getApiKey } from './config/api-keys';

    const app = express();
    const PORT = process.env.PORT || 3001;

    // Middleware
    app.use(cors({
      origin: ['tauri://localhost', 'http://localhost:3000'],
    }));
    app.use(express.json());

    // Initialize Claude client on startup
    try {
      const apiKey = getApiKey();
      getClaudeClient({
        apiKey,
        model: process.env.CLAUDE_MODEL,
      });
      console.log('Claude client initialized');
    } catch (error) {
      console.warn('Claude client not initialized:', error);
      console.warn('API key can be configured via POST /api/chat/configure');
    }

    // Routes
    app.use('/api/chat', chatRouter);

    // Health check
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Error handler
    app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Unhandled error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });

    app.listen(PORT, () => {
      console.log(`Agent Server running on http://localhost:${PORT}`);
    });
    ```
  - [ ] 10.2 Add CORS configuration for Tauri origin
  - [ ] 10.3 Initialize Claude client on server startup
  - [ ] 10.4 Add global error handling middleware

- [ ] **Task 11: Unit Tests** (AC: 1, 4, 5)
  - [ ] 11.1 Test API key format validation:
    ```typescript
    // tests/unit/services/api-keys.test.ts

    import { describe, test, expect } from 'vitest';
    import { validateApiKeyFormat } from '@/agent-server/config/api-keys';

    describe('API Key Validation', () => {
      test('accepts valid API key format', () => {
        const validKey = 'sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
        expect(validateApiKeyFormat(validKey).valid).toBe(true);
      });

      test('rejects empty API key', () => {
        expect(validateApiKeyFormat('').valid).toBe(false);
        expect(validateApiKeyFormat('').error).toContain('required');
      });

      test('rejects API key with wrong prefix', () => {
        const wrongPrefix = 'sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
        expect(validateApiKeyFormat(wrongPrefix).valid).toBe(false);
        expect(validateApiKeyFormat(wrongPrefix).error).toContain('sk-ant-');
      });

      test('rejects API key that is too short', () => {
        const shortKey = 'sk-ant-abc';
        expect(validateApiKeyFormat(shortKey).valid).toBe(false);
      });
    });
    ```
  - [ ] 11.2 Test Claude client message building
  - [ ] 11.3 Test error code mapping
  - [ ] 11.4 Test token extraction from response

- [ ] **Task 12: Integration Tests** (AC: 1, 2, 5, 6)
  - [ ] 12.1 Test full message round-trip:
    ```typescript
    // tests/integration/chat/claude-integration.test.ts

    import { describe, test, expect, beforeAll, afterAll } from 'vitest';
    import { ClaudeClient } from '@/agent-server/services/claude-client';

    describe('Claude Integration', () => {
      let client: ClaudeClient;

      beforeAll(() => {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          throw new Error('ANTHROPIC_API_KEY required for integration tests');
        }
        client = new ClaudeClient({ apiKey });
      });

      test('sends message and receives response', async () => {
        const response = await client.sendMessage('What is 2+2?');

        expect(response.content).toBeTruthy();
        expect(response.content.toLowerCase()).toContain('4');
        expect(response.inputTokens).toBeGreaterThan(0);
        expect(response.outputTokens).toBeGreaterThan(0);
      });

      test('maintains conversation context', async () => {
        const history = [
          { role: 'user' as const, content: 'My name is Alice.' },
          { role: 'assistant' as const, content: 'Hello Alice! How can I help you today?' },
        ];

        const response = await client.sendMessage('What is my name?', history);

        expect(response.content.toLowerCase()).toContain('alice');
      });

      test('handles rate limit gracefully', async () => {
        // This test requires triggering a rate limit
        // which may not be practical in CI
        // Mark as skip or use mock
      });
    }, { timeout: 30000 });
    ```
  - [ ] 12.2 Test conversation context maintenance
  - [ ] 12.3 Test error handling for various API errors
  - [ ] 12.4 Test Agent Server health endpoint

- [ ] **Task 13: E2E Tests** (AC: 1, 3, 5)
  - [ ] 13.1 Create Playwright test for chat flow:
    ```typescript
    // tests/e2e/chat-claude.spec.ts

    import { test, expect } from '@playwright/test';

    test.describe('Claude Chat Integration', () => {
      test('sends message and receives response', async ({ page }) => {
        await page.goto('/');

        // Wait for app to initialize
        await page.waitForSelector('[data-testid="chat-input"]');

        // Type and send message
        await page.fill('[data-testid="chat-input"]', 'Hello Orion, what can you help me with?');
        await page.click('[data-testid="send-button"]');

        // Wait for response
        await expect(page.locator('.chat-agent')).toBeVisible({ timeout: 30000 });

        // Verify response contains relevant content
        const response = await page.locator('.chat-agent').textContent();
        expect(response?.length).toBeGreaterThan(0);
      });

      test('shows error when API key is invalid', async ({ page }) => {
        // This test requires ability to configure invalid key
        // May need test fixture setup
      });

      test('allows retry after error', async ({ page }) => {
        // Test retry button functionality
      });
    });
    ```
  - [ ] 13.2 Test error display and recovery
  - [ ] 13.3 Test message persistence across reload

---

## Dev Notes

### Critical Architecture Constraints

| Constraint | Requirement | Source |
|------------|-------------|--------|
| Agent Server Port | localhost:3001 | ARCH-005 |
| Model Default | claude-sonnet-4-5-20250514 | architecture.md#3.3 |
| Beta Headers | structured-outputs-2025-11-13 | ARCH-018 |
| Context Window | 200k tokens | ARCH-022 |
| Cost Optimization | Prompt caching enabled | ARCH-020 |
| SDK Package | @anthropic-ai/sdk | architecture.md#3.1 |

### API Configuration

**Environment Variables:**
```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Optional (defaults shown)
CLAUDE_MODEL=claude-sonnet-4-5-20250514
AGENT_SERVER_PORT=3001
```

### Error Codes Reference

| Code | HTTP Status | User Message | Retryable |
|------|-------------|--------------|-----------|
| AUTH_ERROR | 401 | Invalid or missing API key | No |
| PERMISSION_ERROR | 403 | API key lacks permission | No |
| RATE_LIMITED | 429 | Rate limit exceeded | Yes (with delay) |
| API_ERROR | 502 | Claude API unavailable | Yes |
| NETWORK_ERROR | 503 | Connection failed | Yes |
| INVALID_INPUT | 400 | Message required | No |
| UNKNOWN_ERROR | 500 | Unexpected error | Yes |

### Anthropic SDK Usage

**Installation:**
```bash
npm install @anthropic-ai/sdk
```

**Key Types:**
```typescript
import Anthropic from '@anthropic-ai/sdk';
import type {
  Message,
  MessageCreateParams,
  ContentBlock,
  TextBlock,
} from '@anthropic-ai/sdk/resources/messages';
```

### Directory Structure for This Story

```
agent-server/
├── src/
│   ├── index.ts                  # MODIFY: Add chat routes
│   ├── config/
│   │   └── api-keys.ts           # CREATE: API key management
│   ├── services/
│   │   └── claude-client.ts      # CREATE: Claude SDK wrapper
│   └── routes/
│       └── chat.ts               # CREATE: Chat API endpoints

src/
├── lib/
│   └── services/
│       └── chatService.ts        # CREATE: Frontend chat service
├── stores/
│   └── chatStore.ts              # MODIFY: Add Claude integration
└── components/
    ├── chat/
    │   ├── ChatInput.tsx         # MODIFY: Add send integration
    │   └── ChatError.tsx         # CREATE: Error display component
    └── settings/
        └── ApiKeyInput.tsx       # CREATE: API key entry UI

src-tauri/src/
└── commands/
    └── chat.rs                   # MODIFY: Add assistant message save

tests/
├── unit/
│   └── services/
│       └── api-keys.test.ts      # CREATE: API key validation tests
├── integration/
│   └── chat/
│       └── claude-integration.test.ts  # CREATE: Claude API tests
└── e2e/
    └── chat-claude.spec.ts       # CREATE: E2E chat tests
```

### Dependencies

**New Dependencies for agent-server:**
```bash
cd agent-server
npm install @anthropic-ai/sdk express cors
npm install -D @types/express @types/cors
```

**No new frontend dependencies required** - uses existing fetch API and Tauri invoke.

### Project Structure Notes

- **Dependency:** Story 1.5 (Agent Server Process) MUST be complete - provides the server infrastructure
- **Dependency:** Story 1.6 (Chat Message Storage) MUST be complete - provides message persistence
- **Parallel:** Can run alongside Story 1.9 (Split-Screen Layout)
- **Enables:** Story 1.8 (Streaming Responses) - will extend this foundation with SSE streaming

### Technical Notes

1. **API Key Security**
   - API key stored in environment variable (not in database or frontend)
   - Never log or expose API key in error messages
   - Consider macOS Keychain integration post-MVP

2. **Conversation Context**
   - Send last 20 messages as context (balance between quality and token usage)
   - SDK session ID stored for potential resume capability
   - System prompt kept consistent across messages

3. **Error Recovery**
   - Store failed message for retry capability
   - Clear retry state on successful send
   - Auto-retry after rate limit countdown

4. **Token Tracking**
   - Extract from response.usage.input_tokens and output_tokens
   - Store per-message for cost analysis
   - Consider aggregating at conversation level

5. **Model Configuration**
   - Default to claude-sonnet-4-5 for balance of speed and quality
   - Allow override via CLAUDE_MODEL environment variable
   - Include beta headers for future structured outputs support

### Learnings from Previous Stories

From Story 1.5 (Agent Server Process):
- Agent Server runs on localhost:3001 as child process
- Health endpoint at /health returns server status
- Server auto-restarts on crash (managed by Tauri)

From Story 1.6 (Chat Message Storage):
- Messages saved with `msg_xxx` ID format
- Conversation stats (message_count, last_message_at) updated on message
- Role validation enforced (user | assistant | system)
- Tool calls stored as JSON arrays

### Testing Standards

| Test Type | Framework | Location | Notes |
|-----------|-----------|----------|-------|
| Unit | Vitest | `tests/unit/services/*.test.ts` | Mock Anthropic client |
| Integration | Vitest | `tests/integration/chat/*.test.ts` | Requires API key |
| E2E | Playwright | `tests/e2e/chat-claude.spec.ts` | Full app testing |

**Integration Test Requirements:**
- Set `ANTHROPIC_API_KEY` environment variable
- Tests may incur API costs
- Use `test.skip` for rate limit tests in CI

### Performance Targets

| Operation | Target | Measurement |
|-----------|--------|-------------|
| Time to first token | <500ms | NFR-P001 |
| API key validation | <3 seconds | AC4 |
| Error display | Immediate | After API response |
| Retry countdown | Accurate to second | UI timer |

---

### References

- [Source: thoughts/planning-artifacts/architecture.md#3.3 Claude API Features]
- [Source: thoughts/planning-artifacts/architecture.md#5.3 Agent Server API]
- [Source: thoughts/planning-artifacts/architecture.md#6.5 Claude Agent SDK Built-in Tools]
- [Source: thoughts/planning-artifacts/architecture.md#6.7 Prompt Caching]
- [Source: thoughts/planning-artifacts/epics.md#Story 1.7: Claude Integration]
- [Source: thoughts/planning-artifacts/prd.md#6.4 AI Integration]
- [Source: thoughts/implementation-artifacts/stories/story-1-5-agent-server-process.md] (prerequisite)
- [Source: thoughts/implementation-artifacts/stories/story-1-6-chat-message-storage.md] (prerequisite)

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-15 | Story created with comprehensive Claude integration implementation | SM Agent (Bob) |

### File List

(To be filled during implementation - track all files created/modified)
