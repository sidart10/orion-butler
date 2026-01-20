# Story 1.8: Streaming Responses

Status: done

---

## Story

As a user,
I want to see Claude's response appear word-by-word,
So that I get immediate feedback and the experience feels responsive.

---

## Acceptance Criteria

1. **AC1: SSE Connection Established**
   - **Given** I send a message to Claude
   - **When** Claude starts responding
   - **Then** tokens stream in real-time via SSE (ARCH-023)
   - **And** the Agent Server establishes an SSE connection to the frontend
   - **And** each token is delivered as a separate SSE event

2. **AC2: Typing Indicator**
   - **Given** I send a message to Claude
   - **When** Claude starts responding
   - **Then** I see a typing indicator before the first token arrives
   - **And** the indicator matches the Orion Design System styling

3. **AC3: First Token Latency**
   - **Given** I send a message to Claude
   - **When** Claude starts responding
   - **Then** latency to first token is <500ms p95 (NFR-P001)
   - **And** the timing is measurable via performance API

4. **AC4: Smooth Token Rendering**
   - **Given** streaming is in progress
   - **When** tokens arrive
   - **Then** they append smoothly without flickering
   - **And** no visual artifacts or jumps occur during rendering

5. **AC5: Auto-Scroll During Streaming**
   - **Given** streaming is in progress
   - **When** tokens arrive
   - **Then** the chat auto-scrolls to show new content
   - **And** the scroll position stays at the bottom during streaming
   - **And** if user scrolls up manually, auto-scroll pauses

6. **AC6: Stream Completion**
   - **Given** streaming completes
   - **When** the final token arrives
   - **Then** the typing indicator disappears
   - **And** the message is marked as complete in the database
   - **And** token counts (input/output) are persisted

7. **AC7: Long Response Handling**
   - **Given** Claude generates a long response (1000+ tokens)
   - **When** streaming
   - **Then** tokens render smoothly throughout
   - **And** memory usage remains stable
   - **And** UI remains responsive

8. **AC8: Tauri IPC Event Forwarding**
   - **Given** the Agent Server receives SSE events
   - **When** events are received
   - **Then** they are forwarded to the WebView via Tauri events (ARCH-024)
   - **And** the frontend receives events via `listen()` API

---

## Tasks / Subtasks

- [x] **Task 1: Extend Claude Client for Streaming** (AC: 1, 3)
  - [x] 1.1 Modify `agent-server/src/services/claude-client.ts`:
    ```typescript
    // agent-server/src/services/claude-client.ts

    import Anthropic from '@anthropic-ai/sdk';
    import type {
      MessageStream,
      MessageStreamEvent,
    } from '@anthropic-ai/sdk/lib/MessageStream';
    import type { MessageCreateParamsStreaming } from '@anthropic-ai/sdk/resources/messages';

    export interface StreamCallbacks {
      onText: (text: string) => void;
      onThinking?: (thinking: string) => void;
      onToolStart?: (toolId: string, toolName: string) => void;
      onToolInput?: (toolId: string, input: Record<string, unknown>) => void;
      onToolComplete?: (toolId: string, result: unknown) => void;
      onComplete: (usage: { inputTokens: number; outputTokens: number }) => void;
      onError: (error: Error) => void;
    }

    export class ClaudeClient {
      private client: Anthropic;
      private model: string;
      private maxTokens: number;

      // ... existing constructor from Story 1.7 ...

      async sendMessageStreaming(
        userMessage: string,
        conversationHistory: ConversationMessage[] = [],
        systemPrompt: string | undefined,
        callbacks: StreamCallbacks,
      ): Promise<void> {
        // Build messages array with history
        const messages = conversationHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

        // Add current user message
        messages.push({ role: 'user', content: userMessage });

        const params: MessageCreateParamsStreaming = {
          model: this.model,
          max_tokens: this.maxTokens,
          messages,
          stream: true,
        };

        if (systemPrompt) {
          params.system = systemPrompt;
        }

        try {
          const stream = await this.client.messages.stream(params, {
            headers: {
              'anthropic-beta': 'structured-outputs-2025-11-13',
            },
          });

          // Process stream events
          for await (const event of stream) {
            this.handleStreamEvent(event, callbacks);
          }

          // Get final message for usage stats
          const finalMessage = await stream.finalMessage();
          callbacks.onComplete({
            inputTokens: finalMessage.usage.input_tokens,
            outputTokens: finalMessage.usage.output_tokens,
          });

        } catch (error) {
          callbacks.onError(error as Error);
        }
      }

      private handleStreamEvent(event: MessageStreamEvent, callbacks: StreamCallbacks): void {
        switch (event.type) {
          case 'content_block_delta':
            if (event.delta.type === 'text_delta') {
              callbacks.onText(event.delta.text);
            } else if (event.delta.type === 'thinking_delta' && callbacks.onThinking) {
              callbacks.onThinking(event.delta.thinking);
            }
            break;

          case 'content_block_start':
            if (event.content_block.type === 'tool_use' && callbacks.onToolStart) {
              callbacks.onToolStart(event.content_block.id, event.content_block.name);
            }
            break;

          // Tool events will be handled in future stories (tool call visualization)
        }
      }
    }
    ```
  - [x] 1.2 Add streaming method to existing ClaudeClient class
  - [x] 1.3 Implement stream event handling for text deltas
  - [x] 1.4 Handle thinking deltas for extended thinking support (future)

- [x] **Task 2: Create SSE Streaming Endpoint** (AC: 1)
  - [x] 2.1 Update `agent-server/src/routes/stream.ts`:
    ```typescript
    // agent-server/src/routes/stream.ts

    import { Router, Request, Response } from 'express';
    import { getClaudeClient } from '../services/claude-client';
    import type { ConversationMessage, StreamCallbacks } from '../services/claude-client';

    const router = Router();

    interface StreamRequest {
      message: string;
      conversationId: string;
      history?: ConversationMessage[];
      systemPrompt?: string;
    }

    // GET /api/stream/:streamId - SSE endpoint
    router.get('/:streamId', async (req: Request, res: Response) => {
      const { streamId } = req.params;

      // Parse query params (message sent via query for SSE GET request)
      const message = req.query.message as string;
      const conversationId = req.query.conversationId as string;
      const historyJson = req.query.history as string | undefined;
      const history = historyJson ? JSON.parse(historyJson) : [];

      if (!message) {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      // Send initial connected event
      sendSSE(res, 'connected', { streamId, timestamp: Date.now() });

      const client = getClaudeClient();

      // Butler system prompt
      const systemPrompt = `You are Orion, an AI-powered personal butler assistant. You help users manage their digital lives by assisting with email, calendar, tasks, and relationships.

Be helpful, concise, and proactive. Ask clarifying questions when needed. Remember context from the conversation.`;

      const callbacks: StreamCallbacks = {
        onText: (text) => {
          sendSSE(res, 'text', { content: text });
        },

        onThinking: (thinking) => {
          sendSSE(res, 'thinking', { content: thinking });
        },

        onToolStart: (toolId, toolName) => {
          sendSSE(res, 'tool_start', { toolId, toolName });
        },

        onToolInput: (toolId, input) => {
          sendSSE(res, 'tool_input', { toolId, input });
        },

        onToolComplete: (toolId, result) => {
          sendSSE(res, 'tool_complete', { toolId, result });
        },

        onComplete: (usage) => {
          sendSSE(res, 'complete', {
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            timestamp: Date.now(),
          });
          res.end();
        },

        onError: (error) => {
          sendSSE(res, 'error', {
            message: error.message,
            code: getErrorCode(error),
          });
          res.end();
        },
      };

      try {
        await client.sendMessageStreaming(message, history, systemPrompt, callbacks);
      } catch (error) {
        console.error('Stream error:', error);
        sendSSE(res, 'error', { message: 'Stream failed unexpectedly' });
        res.end();
      }
    });

    // POST /api/stream/start - Alternative POST endpoint for larger payloads
    router.post('/start', async (req: Request, res: Response) => {
      const { message, conversationId, history = [], systemPrompt } = req.body as StreamRequest;

      if (!message) {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      // Generate stream ID
      const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      sendSSE(res, 'connected', { streamId, timestamp: Date.now() });

      const client = getClaudeClient();

      const callbacks: StreamCallbacks = {
        onText: (text) => sendSSE(res, 'text', { content: text }),
        onThinking: (thinking) => sendSSE(res, 'thinking', { content: thinking }),
        onToolStart: (toolId, toolName) => sendSSE(res, 'tool_start', { toolId, toolName }),
        onToolInput: (toolId, input) => sendSSE(res, 'tool_input', { toolId, input }),
        onToolComplete: (toolId, result) => sendSSE(res, 'tool_complete', { toolId, result }),
        onComplete: (usage) => {
          sendSSE(res, 'complete', {
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            timestamp: Date.now(),
          });
          res.end();
        },
        onError: (error) => {
          sendSSE(res, 'error', {
            message: error.message,
            code: getErrorCode(error),
          });
          res.end();
        },
      };

      const butlerPrompt = systemPrompt || `You are Orion, an AI-powered personal butler...`;

      try {
        await client.sendMessageStreaming(message, history, butlerPrompt, callbacks);
      } catch (error) {
        console.error('Stream error:', error);
        sendSSE(res, 'error', { message: 'Stream failed unexpectedly' });
        res.end();
      }
    });

    function sendSSE(res: Response, event: string, data: Record<string, unknown>): void {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }

    function getErrorCode(error: Error & { status?: number }): string {
      if (error.status === 429) return 'RATE_LIMITED';
      if (error.status === 401) return 'AUTH_ERROR';
      if (error.status === 403) return 'PERMISSION_ERROR';
      if (error.status && error.status >= 500) return 'API_ERROR';
      return 'UNKNOWN_ERROR';
    }

    export default router;
    ```
  - [x] 2.2 Replace placeholder SSE endpoint from Story 1.5
  - [x] 2.3 Implement proper SSE event formatting
  - [x] 2.4 Add error handling with appropriate error codes
  - [x] 2.5 Support both GET (query params) and POST (body) for different payload sizes

- [x] **Task 3: Register Stream Routes** (AC: 1)
  - [x] 3.1 Update `agent-server/src/index.ts`:
    ```typescript
    // Add to agent-server/src/index.ts

    import streamRouter from './routes/stream';

    // Register routes
    app.use('/api/chat', chatRouter);
    app.use('/api/stream', streamRouter);  // Add this line
    ```
  - [x] 3.2 Register stream routes in Express app

- [x] **Task 4: Create Streaming Types** (AC: 1, 8)
  - [x] 4.1 Create `src/types/streaming.ts`:
    ```typescript
    // src/types/streaming.ts

    export type StreamEventType =
      | 'connected'
      | 'thinking'
      | 'text'
      | 'tool_start'
      | 'tool_input'
      | 'tool_complete'
      | 'tool_error'
      | 'complete'
      | 'error';

    export interface StreamEvent {
      type: StreamEventType;
      timestamp?: number;

      // Connected event
      streamId?: string;

      // Text content
      content?: string;

      // Tool events
      toolId?: string;
      toolName?: string;
      toolInput?: Record<string, unknown>;
      toolResult?: unknown;
      toolError?: string;

      // Complete event
      inputTokens?: number;
      outputTokens?: number;

      // Error
      message?: string;
      code?: string;
    }

    export interface StreamState {
      isStreaming: boolean;
      currentStreamId: string | null;
      firstTokenReceived: boolean;
      firstTokenLatencyMs: number | null;
      totalTokens: number;
      startTime: number | null;
    }
    ```
  - [x] 4.2 Define all stream event types
  - [x] 4.3 Add streaming state interface for tracking

- [x] **Task 5: Create Streaming Service** (AC: 1, 3, 8)
  - [x] 5.1 Create `src/lib/services/streamingService.ts`:
    ```typescript
    // src/lib/services/streamingService.ts

    import type { StreamEvent, StreamEventType } from '@/types/streaming';

    export interface StreamingCallbacks {
      onConnected: (streamId: string) => void;
      onText: (text: string) => void;
      onThinking?: (thinking: string) => void;
      onToolStart?: (toolId: string, toolName: string) => void;
      onToolComplete?: (toolId: string, result: unknown) => void;
      onComplete: (inputTokens: number, outputTokens: number) => void;
      onError: (message: string, code: string) => void;
    }

    export class StreamingService {
      private baseUrl: string;
      private eventSource: EventSource | null = null;
      private abortController: AbortController | null = null;

      constructor(baseUrl: string = 'http://localhost:3001') {
        this.baseUrl = baseUrl;
      }

      async startStream(
        message: string,
        conversationId: string,
        history: Array<{ role: 'user' | 'assistant'; content: string }>,
        callbacks: StreamingCallbacks,
      ): Promise<void> {
        // Use POST endpoint for SSE (allows larger payloads)
        const response = await fetch(`${this.baseUrl}/api/stream/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, conversationId, history }),
        });

        if (!response.ok) {
          const error = await response.json();
          callbacks.onError(error.error || 'Failed to start stream', 'CONNECTION_ERROR');
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          callbacks.onError('No response body', 'CONNECTION_ERROR');
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Parse SSE events from buffer
            const events = this.parseSSEEvents(buffer);
            buffer = events.remaining;

            for (const event of events.parsed) {
              this.handleEvent(event, callbacks);
            }
          }
        } catch (error) {
          callbacks.onError('Stream interrupted', 'STREAM_ERROR');
        }
      }

      private parseSSEEvents(buffer: string): {
        parsed: StreamEvent[];
        remaining: string;
      } {
        const parsed: StreamEvent[] = [];
        const lines = buffer.split('\n');
        let remaining = '';
        let currentEvent: Partial<StreamEvent> = {};

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.startsWith('event: ')) {
            currentEvent.type = line.slice(7) as StreamEventType;
          } else if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              currentEvent = { ...currentEvent, ...data };
            } catch {
              // Incomplete JSON, keep in buffer
              remaining = lines.slice(i).join('\n');
              break;
            }
          } else if (line === '' && currentEvent.type) {
            parsed.push(currentEvent as StreamEvent);
            currentEvent = {};
          }
        }

        return { parsed, remaining };
      }

      private handleEvent(event: StreamEvent, callbacks: StreamingCallbacks): void {
        switch (event.type) {
          case 'connected':
            callbacks.onConnected(event.streamId!);
            break;

          case 'text':
            callbacks.onText(event.content || '');
            break;

          case 'thinking':
            callbacks.onThinking?.(event.content || '');
            break;

          case 'tool_start':
            callbacks.onToolStart?.(event.toolId!, event.toolName!);
            break;

          case 'tool_complete':
            callbacks.onToolComplete?.(event.toolId!, event.toolResult);
            break;

          case 'complete':
            callbacks.onComplete(event.inputTokens || 0, event.outputTokens || 0);
            break;

          case 'error':
            callbacks.onError(event.message || 'Unknown error', event.code || 'UNKNOWN');
            break;
        }
      }

      abort(): void {
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        if (this.abortController) {
          this.abortController.abort();
          this.abortController = null;
        }
      }
    }

    export const streamingService = new StreamingService();
    ```
  - [x] 5.2 Implement SSE parsing from fetch response
  - [x] 5.3 Handle all event types with callbacks
  - [x] 5.4 Add abort capability for cancellation

- [x] **Task 6: Create Tauri IPC Stream Forwarding** (AC: 8)
  - [x] 6.1 Create `src-tauri/src/stream_forwarder.rs`:
    ```rust
    // src-tauri/src/stream_forwarder.rs

    use reqwest::Client;
    use serde::{Deserialize, Serialize};
    use tauri::{AppHandle, Emitter};
    use futures_util::StreamExt;

    #[derive(Clone, Serialize)]
    pub struct StreamEventPayload {
        pub event_type: String,
        pub content: Option<String>,
        pub stream_id: Option<String>,
        pub tool_id: Option<String>,
        pub tool_name: Option<String>,
        pub input_tokens: Option<i32>,
        pub output_tokens: Option<i32>,
        pub error_message: Option<String>,
        pub error_code: Option<String>,
    }

    #[tauri::command]
    pub async fn start_agent_stream(
        app: AppHandle,
        stream_id: String,
        message: String,
        conversation_id: String,
        history: Vec<serde_json::Value>,
    ) -> Result<(), String> {
        let client = Client::new();

        let payload = serde_json::json!({
            "message": message,
            "conversationId": conversation_id,
            "history": history,
        });

        let response = client
            .post("http://localhost:3001/api/stream/start")
            .json(&payload)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        let mut stream = response.bytes_stream();
        let mut buffer = String::new();

        while let Some(chunk_result) = stream.next().await {
            let chunk = chunk_result.map_err(|e| e.to_string())?;
            buffer.push_str(&String::from_utf8_lossy(&chunk));

            // Parse SSE events from buffer
            while let Some(pos) = buffer.find("\n\n") {
                let event_str = buffer[..pos].to_string();
                buffer = buffer[pos + 2..].to_string();

                if let Some(payload) = parse_sse_event(&event_str) {
                    let event_name = format!("agent:stream:{}", stream_id);
                    app.emit(&event_name, payload).map_err(|e| e.to_string())?;
                }
            }
        }

        Ok(())
    }

    fn parse_sse_event(event_str: &str) -> Option<StreamEventPayload> {
        let mut event_type = String::new();
        let mut data_str = String::new();

        for line in event_str.lines() {
            if let Some(stripped) = line.strip_prefix("event: ") {
                event_type = stripped.to_string();
            } else if let Some(stripped) = line.strip_prefix("data: ") {
                data_str = stripped.to_string();
            }
        }

        if event_type.is_empty() || data_str.is_empty() {
            return None;
        }

        let data: serde_json::Value = serde_json::from_str(&data_str).ok()?;

        Some(StreamEventPayload {
            event_type,
            content: data.get("content").and_then(|v| v.as_str()).map(|s| s.to_string()),
            stream_id: data.get("streamId").and_then(|v| v.as_str()).map(|s| s.to_string()),
            tool_id: data.get("toolId").and_then(|v| v.as_str()).map(|s| s.to_string()),
            tool_name: data.get("toolName").and_then(|v| v.as_str()).map(|s| s.to_string()),
            input_tokens: data.get("inputTokens").and_then(|v| v.as_i64()).map(|n| n as i32),
            output_tokens: data.get("outputTokens").and_then(|v| v.as_i64()).map(|n| n as i32),
            error_message: data.get("message").and_then(|v| v.as_str()).map(|s| s.to_string()),
            error_code: data.get("code").and_then(|v| v.as_str()).map(|s| s.to_string()),
        })
    }
    ```
  - [x] 6.2 Create Rust command for starting stream
  - [x] 6.3 Implement SSE parsing in Rust
  - [x] 6.4 Emit Tauri events for each stream event
  - [x] 6.5 Register command in Tauri plugin system

- [x] **Task 7: Update Chat Store for Streaming** (AC: 1, 2, 4, 6)
  - [x] 7.1 Extend `src/stores/chatStore.ts`:
    ```typescript
    // Extend existing chatStore.ts from Story 1.7

    import { create } from 'zustand';
    import { immer } from 'zustand/middleware/immer';
    import { listen, UnlistenFn } from '@tauri-apps/api/event';
    import { invoke } from '@tauri-apps/api/core';
    import { chatCommands } from '@/lib/tauri/commands/chat';
    import type { Message, Conversation } from '@/lib/db/types';
    import type { StreamEvent, StreamState } from '@/types/streaming';

    interface ChatState {
      // Existing state from Story 1.7
      conversations: Conversation[];
      activeConversationId: string | null;
      messages: Message[];
      isLoading: boolean;
      error: string | null;
      isSending: boolean;
      sendError: { error: string; code: string; retryable: boolean } | null;
      retryMessage: string | null;
      apiKeyConfigured: boolean;

      // NEW: Streaming state
      isStreaming: boolean;
      currentStreamId: string | null;
      firstTokenReceived: boolean;
      firstTokenLatencyMs: number | null;
      streamStartTime: number | null;
      pendingAssistantContent: string;  // Accumulates streaming content

      // Existing actions
      loadConversations: () => Promise<void>;
      selectConversation: (id: string) => Promise<void>;
      createNewConversation: () => Promise<Conversation>;
      checkApiKeyStatus: () => Promise<void>;

      // NEW: Streaming actions
      sendMessageStreaming: (content: string) => Promise<void>;
      appendToStream: (text: string) => void;
      completeStream: (inputTokens: number, outputTokens: number) => void;
      setStreamError: (message: string, code: string) => void;
      cancelStream: () => void;
    }

    let streamUnlisten: UnlistenFn | null = null;

    export const useChatStore = create<ChatState>()(
      immer((set, get) => ({
        // ... existing state initialization from Story 1.7 ...

        // NEW: Streaming state
        isStreaming: false,
        currentStreamId: null,
        firstTokenReceived: false,
        firstTokenLatencyMs: null,
        streamStartTime: null,
        pendingAssistantContent: '',

        sendMessageStreaming: async (content: string) => {
          const { activeConversationId, messages } = get();

          if (!activeConversationId) {
            const conv = await get().createNewConversation();
            set((state) => { state.activeConversationId = conv.id; });
          }

          // Generate stream ID
          const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          set((state) => {
            state.isStreaming = true;
            state.currentStreamId = streamId;
            state.firstTokenReceived = false;
            state.firstTokenLatencyMs = null;
            state.streamStartTime = Date.now();
            state.pendingAssistantContent = '';
            state.sendError = null;
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

            // Add placeholder assistant message
            const assistantPlaceholder: Message = {
              id: `pending_${streamId}`,
              conversation_id: get().activeConversationId!,
              role: 'assistant',
              content: '',
              created_at: new Date().toISOString(),
            };

            set((state) => {
              state.messages.push(assistantPlaceholder);
            });

            // Build conversation history
            const history = messages
              .filter(m => m.role !== 'system')
              .slice(-20)
              .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

            // Listen for stream events via Tauri
            streamUnlisten = await listen<StreamEvent>(
              `agent:stream:${streamId}`,
              (event) => {
                const payload = event.payload;

                switch (payload.event_type) {
                  case 'text':
                    get().appendToStream(payload.content || '');
                    break;

                  case 'complete':
                    get().completeStream(
                      payload.input_tokens || 0,
                      payload.output_tokens || 0,
                    );
                    break;

                  case 'error':
                    get().setStreamError(
                      payload.error_message || 'Stream error',
                      payload.error_code || 'UNKNOWN',
                    );
                    break;
                }
              },
            );

            // Start stream via Tauri command
            await invoke('start_agent_stream', {
              streamId,
              message: content,
              conversationId: get().activeConversationId!,
              history,
            });

          } catch (error: any) {
            set((state) => {
              state.isStreaming = false;
              state.sendError = {
                error: error.message || 'Failed to start stream',
                code: 'STREAM_ERROR',
                retryable: true,
              };
              state.retryMessage = content;
            });
          }
        },

        appendToStream: (text: string) => {
          set((state) => {
            // Track first token latency
            if (!state.firstTokenReceived && state.streamStartTime) {
              state.firstTokenReceived = true;
              state.firstTokenLatencyMs = Date.now() - state.streamStartTime;
            }

            // Append to pending content
            state.pendingAssistantContent += text;

            // Update the last (assistant) message
            const lastMessage = state.messages[state.messages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              lastMessage.content = state.pendingAssistantContent;
            }
          });
        },

        completeStream: async (inputTokens: number, outputTokens: number) => {
          const { activeConversationId, pendingAssistantContent, currentStreamId } = get();

          // Cleanup listener
          if (streamUnlisten) {
            streamUnlisten();
            streamUnlisten = null;
          }

          // Save completed assistant message to database
          const savedMessage = await invoke<Message>('save_assistant_message', {
            conversationId: activeConversationId,
            content: pendingAssistantContent,
            inputTokens,
            outputTokens,
          });

          set((state) => {
            // Replace placeholder with saved message
            const placeholderIndex = state.messages.findIndex(
              m => m.id === `pending_${currentStreamId}`,
            );
            if (placeholderIndex >= 0) {
              state.messages[placeholderIndex] = savedMessage;
            }

            state.isStreaming = false;
            state.currentStreamId = null;
            state.pendingAssistantContent = '';
          });
        },

        setStreamError: (message: string, code: string) => {
          // Cleanup listener
          if (streamUnlisten) {
            streamUnlisten();
            streamUnlisten = null;
          }

          set((state) => {
            state.isStreaming = false;
            state.currentStreamId = null;
            state.sendError = {
              error: message,
              code,
              retryable: code !== 'AUTH_ERROR',
            };
            // Remove placeholder message on error
            state.messages = state.messages.filter(
              m => !m.id.startsWith('pending_'),
            );
          });
        },

        cancelStream: () => {
          if (streamUnlisten) {
            streamUnlisten();
            streamUnlisten = null;
          }

          set((state) => {
            state.isStreaming = false;
            state.currentStreamId = null;
            state.pendingAssistantContent = '';
            // Remove placeholder
            state.messages = state.messages.filter(
              m => !m.id.startsWith('pending_'),
            );
          });
        },
      }))
    );
    ```
  - [x] 7.2 Add streaming state variables
  - [x] 7.3 Implement `sendMessageStreaming` action
  - [x] 7.4 Implement `appendToStream` with first token tracking
  - [x] 7.5 Implement `completeStream` with database persistence
  - [x] 7.6 Add stream cancellation capability

- [x] **Task 8: Create Typing Indicator Component** (AC: 2)
  - [x] 8.1 Create `src/components/chat/TypingIndicator.tsx`:
    ```typescript
    // src/components/chat/TypingIndicator.tsx

    'use client';

    import { useChatStore } from '@/stores/chatStore';

    export function TypingIndicator() {
      const { isStreaming, firstTokenReceived } = useChatStore();

      // Only show before first token arrives
      if (!isStreaming || firstTokenReceived) {
        return null;
      }

      return (
        <div className="flex items-center gap-2 px-4 py-2" data-testid="typing-indicator">
          <div className="flex gap-1">
            <span
              className="w-2 h-2 bg-orion-primary rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            />
            <span
              className="w-2 h-2 bg-orion-primary rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <span
              className="w-2 h-2 bg-orion-primary rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </div>
          <span className="text-xs text-orion-fg/50 uppercase tracking-editorial">
            Orion is thinking...
          </span>
        </div>
      );
    }
    ```
  - [x] 8.2 Style with Orion Design System (gold color, editorial typography)
  - [x] 8.3 Add bounce animation for dots
  - [x] 8.4 Show only before first token, hide after

- [x] **Task 9: Create Streaming Text Component** (AC: 4)
  - [x] 9.1 Create `src/components/chat/StreamingText.tsx`:
    ```typescript
    // src/components/chat/StreamingText.tsx

    'use client';

    import { useRef, useEffect } from 'react';

    interface StreamingTextProps {
      content: string;
      isStreaming: boolean;
    }

    export function StreamingText({ content, isStreaming }: StreamingTextProps) {
      const containerRef = useRef<HTMLDivElement>(null);

      // Optional: Add a subtle cursor at the end while streaming
      const displayContent = isStreaming ? content + '|' : content;

      return (
        <div ref={containerRef} className="whitespace-pre-wrap">
          {displayContent}
          {isStreaming && (
            <span className="inline-block w-0.5 h-4 bg-orion-primary ml-0.5 animate-pulse" />
          )}
        </div>
      );
    }
    ```
  - [x] 9.2 Render text with whitespace preservation
  - [x] 9.3 Add streaming cursor indicator
  - [x] 9.4 Optimize re-renders during rapid updates

- [x] **Task 10: Implement Auto-Scroll** (AC: 5)
  - [x] 10.1 Create `src/hooks/useAutoScroll.ts`:
    ```typescript
    // src/hooks/useAutoScroll.ts

    import { useRef, useEffect, useState, useCallback } from 'react';

    interface UseAutoScrollOptions {
      threshold?: number;  // Distance from bottom to trigger auto-scroll
      enabled?: boolean;
    }

    export function useAutoScroll<T extends HTMLElement>(
      dependency: unknown,
      options: UseAutoScrollOptions = {},
    ) {
      const { threshold = 100, enabled = true } = options;
      const containerRef = useRef<T>(null);
      const [isUserScrolled, setIsUserScrolled] = useState(false);

      // Check if user has scrolled up
      const handleScroll = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const isAtBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight < threshold;

        setIsUserScrolled(!isAtBottom);
      }, [threshold]);

      // Auto-scroll when dependency changes
      useEffect(() => {
        if (!enabled || isUserScrolled) return;

        const container = containerRef.current;
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, [dependency, enabled, isUserScrolled]);

      // Reset user scroll state when streaming completes
      const resetScroll = useCallback(() => {
        setIsUserScrolled(false);
      }, []);

      return {
        containerRef,
        isUserScrolled,
        resetScroll,
        handleScroll,
      };
    }
    ```
  - [x] 10.2 Implement auto-scroll on new content
  - [x] 10.3 Detect user manual scroll to pause auto-scroll
  - [x] 10.4 Reset scroll state when streaming completes

- [x] **Task 11: Update Message List for Streaming** (AC: 4, 5, 7)
  - [x] 11.1 Update `src/components/chat/MessageList.tsx`:
    ```typescript
    // src/components/chat/MessageList.tsx

    'use client';

    import { useChatStore } from '@/stores/chatStore';
    import { useAutoScroll } from '@/hooks/useAutoScroll';
    import { MessageBubble } from './MessageBubble';
    import { TypingIndicator } from './TypingIndicator';

    export function MessageList() {
      const { messages, isStreaming, pendingAssistantContent, firstTokenReceived } = useChatStore();

      // Auto-scroll when content changes
      const { containerRef, handleScroll, isUserScrolled } = useAutoScroll<HTMLDivElement>(
        [messages, pendingAssistantContent],
        { enabled: isStreaming },
      );

      return (
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4"
          data-testid="message-list"
        >
          {messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1;
            const isStreamingMessage =
              isLastMessage && message.role === 'assistant' && isStreaming;

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isStreaming={isStreamingMessage}
              />
            );
          })}

          {/* Show typing indicator before first token */}
          {isStreaming && !firstTokenReceived && <TypingIndicator />}

          {/* Scroll anchor */}
          <div id="messages-end" />

          {/* User scrolled indicator */}
          {isUserScrolled && isStreaming && (
            <button
              onClick={() => {
                containerRef.current?.scrollTo({
                  top: containerRef.current.scrollHeight,
                  behavior: 'smooth',
                });
              }}
              className="fixed bottom-24 right-8 px-3 py-1.5 bg-orion-fg text-orion-bg text-xs uppercase tracking-editorial"
            >
              Scroll to bottom
            </button>
          )}
        </div>
      );
    }
    ```
  - [x] 11.2 Integrate auto-scroll hook
  - [x] 11.3 Show typing indicator at correct time
  - [x] 11.4 Add "scroll to bottom" button when user scrolled up
  - [x] 11.5 Pass streaming state to message bubbles

- [x] **Task 12: Update Message Bubble for Streaming** (AC: 4)
  - [x] 12.1 Update `src/components/chat/MessageBubble.tsx`:
    ```typescript
    // src/components/chat/MessageBubble.tsx

    'use client';

    import type { Message } from '@/lib/db/types';
    import { StreamingText } from './StreamingText';

    interface MessageBubbleProps {
      message: Message;
      isStreaming?: boolean;
    }

    export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
      const isUser = message.role === 'user';

      return (
        <div
          className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
          data-testid={`message-${message.role}`}
        >
          <div
            className={`max-w-[80%] px-4 py-3 ${
              isUser
                ? 'bg-orion-fg text-orion-bg'  // User: black bg, cream text
                : 'border-l-2 border-orion-primary bg-transparent'  // Agent: gold border
            }`}
          >
            {isStreaming ? (
              <StreamingText content={message.content} isStreaming={true} />
            ) : (
              <div className="whitespace-pre-wrap">{message.content}</div>
            )}
          </div>
        </div>
      );
    }
    ```
  - [x] 12.2 Use StreamingText component for streaming messages
  - [x] 12.3 Apply Orion Design System chat styles

- [x] **Task 13: Update Chat Input for Streaming** (AC: 1, 6)
  - [x] 13.1 Update `src/components/chat/ChatInput.tsx`:
    ```typescript
    // Update existing ChatInput.tsx

    import { useState, useRef, useEffect } from 'react';
    import { useChatStore } from '@/stores/chatStore';
    import { ChatErrorDisplay } from './ChatError';

    export function ChatInput() {
      const [input, setInput] = useState('');
      const textareaRef = useRef<HTMLTextAreaElement>(null);
      const {
        sendMessageStreaming,  // Use streaming method now
        isStreaming,
        cancelStream,
        sendError,
        apiKeyConfigured,
        clearSendError,
        retryMessage,
      } = useChatStore();

      const handleSubmit = async () => {
        if (!input.trim() || isStreaming) return;

        const message = input;
        setInput('');
        await sendMessageStreaming(message);  // Use streaming
      };

      const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.metaKey) {
          e.preventDefault();
          handleSubmit();
        }
      };

      // ... existing auto-resize logic ...

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
              disabled={isStreaming}
              data-testid="chat-input"
            />

            {isStreaming ? (
              <button
                onClick={cancelStream}
                className="px-6 py-3 border border-red-500 text-red-500 hover:bg-red-500/10"
                data-testid="cancel-button"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="btn-gold-slide px-6 py-3"
                data-testid="send-button"
              >
                Send
              </button>
            )}
          </div>

          {sendError && (
            <div className="mt-2">
              <ChatErrorDisplay
                error={sendError}
                onRetry={() => {
                  if (retryMessage) {
                    clearSendError();
                    sendMessageStreaming(retryMessage);
                  }
                }}
                onDismiss={clearSendError}
              />
            </div>
          )}
        </div>
      );
    }
    ```
  - [x] 13.2 Switch from `sendMessage` to `sendMessageStreaming`
  - [x] 13.3 Add cancel button during streaming
  - [x] 13.4 Disable input during streaming

- [x] **Task 14: Performance Monitoring** (AC: 3, 7)
  - [x] 14.1 Create `src/lib/performance/streamMetrics.ts`:
    ```typescript
    // src/lib/performance/streamMetrics.ts

    interface StreamMetrics {
      streamId: string;
      startTime: number;
      firstTokenTime: number | null;
      endTime: number | null;
      totalTokens: number;
      tokensPerSecond: number | null;
    }

    const metrics: Map<string, StreamMetrics> = new Map();

    export function startStreamMetrics(streamId: string): void {
      metrics.set(streamId, {
        streamId,
        startTime: performance.now(),
        firstTokenTime: null,
        endTime: null,
        totalTokens: 0,
        tokensPerSecond: null,
      });
    }

    export function recordFirstToken(streamId: string): void {
      const m = metrics.get(streamId);
      if (m && !m.firstTokenTime) {
        m.firstTokenTime = performance.now();
        console.log(
          `[Metrics] Stream ${streamId}: First token latency = ${(m.firstTokenTime - m.startTime).toFixed(2)}ms`,
        );
      }
    }

    export function recordToken(streamId: string, tokenCount: number = 1): void {
      const m = metrics.get(streamId);
      if (m) {
        m.totalTokens += tokenCount;
      }
    }

    export function endStreamMetrics(streamId: string): StreamMetrics | null {
      const m = metrics.get(streamId);
      if (!m) return null;

      m.endTime = performance.now();
      const duration = (m.endTime - m.startTime) / 1000;
      m.tokensPerSecond = m.totalTokens / duration;

      console.log(
        `[Metrics] Stream ${streamId} complete:`,
        `Duration = ${duration.toFixed(2)}s,`,
        `Tokens = ${m.totalTokens},`,
        `Rate = ${m.tokensPerSecond.toFixed(2)} tok/s,`,
        `First token = ${m.firstTokenTime ? (m.firstTokenTime - m.startTime).toFixed(2) : 'N/A'}ms`,
      );

      return m;
    }

    export function getMetrics(streamId: string): StreamMetrics | undefined {
      return metrics.get(streamId);
    }
    ```
  - [x] 14.2 Track first token latency
  - [x] 14.3 Track total tokens and tokens/second
  - [x] 14.4 Log performance metrics for debugging

- [x] **Task 15: Unit Tests** (AC: 2, 3, 4)
  - [x] 15.1 Test typing indicator state machine:
    ```typescript
    // tests/unit/components/TypingIndicator.test.tsx

    import { describe, test, expect, vi } from 'vitest';
    import { render, screen } from '@testing-library/react';
    import { TypingIndicator } from '@/components/chat/TypingIndicator';
    import { useChatStore } from '@/stores/chatStore';

    vi.mock('@/stores/chatStore');

    describe('TypingIndicator', () => {
      test('shows when streaming and no first token', () => {
        vi.mocked(useChatStore).mockReturnValue({
          isStreaming: true,
          firstTokenReceived: false,
        } as any);

        render(<TypingIndicator />);
        expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
      });

      test('hides after first token received', () => {
        vi.mocked(useChatStore).mockReturnValue({
          isStreaming: true,
          firstTokenReceived: true,
        } as any);

        render(<TypingIndicator />);
        expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument();
      });

      test('hides when not streaming', () => {
        vi.mocked(useChatStore).mockReturnValue({
          isStreaming: false,
          firstTokenReceived: false,
        } as any);

        render(<TypingIndicator />);
        expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument();
      });
    });
    ```
  - [x] 15.2 Test SSE event parsing
  - [x] 15.3 Test auto-scroll hook
  - [x] 15.4 Test streaming text component

- [x] **Task 16: Integration Tests** (AC: 1, 6)
  - [x] 16.1 Test SSE endpoint:
    ```typescript
    // tests/integration/streaming/sse-endpoint.test.ts

    import { describe, test, expect, beforeAll } from 'vitest';

    describe('SSE Streaming Endpoint', () => {
      beforeAll(() => {
        // Ensure agent server is running
      });

      test('establishes SSE connection and receives events', async () => {
        const response = await fetch('http://localhost:3001/api/stream/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'Say "hello" and nothing else.',
            conversationId: 'test-conv',
            history: [],
          }),
        });

        expect(response.headers.get('content-type')).toContain('text/event-stream');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let receivedText = false;
        let receivedComplete = false;

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          if (chunk.includes('event: text')) receivedText = true;
          if (chunk.includes('event: complete')) receivedComplete = true;
        }

        expect(receivedText).toBe(true);
        expect(receivedComplete).toBe(true);
      }, 30000);
    });
    ```
  - [x] 16.2 Test stream completion persists to database
  - [x] 16.3 Test error handling during stream

- [x] **Task 17: E2E Tests** (AC: 1, 3, 4, 7)
  - [x] 17.1 Create Playwright tests:
    ```typescript
    // tests/e2e/streaming.spec.ts

    // Using Vercel Browser Agent per architecture.md;

    test.describe('Streaming Responses', () => {
      test('shows typing indicator before first token', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('[data-testid="chat-input"]');

        // Send message
        await page.fill('[data-testid="chat-input"]', 'Hello');
        await page.click('[data-testid="send-button"]');

        // Typing indicator should appear
        await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible();

        // Then disappear when text arrives
        await expect(page.locator('[data-testid="typing-indicator"]')).not.toBeVisible({ timeout: 5000 });
      });

      test('streams response smoothly', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('[data-testid="chat-input"]');

        await page.fill('[data-testid="chat-input"]', 'Write a haiku about coding');
        await page.click('[data-testid="send-button"]');

        // Wait for response to start
        await expect(page.locator('[data-testid="message-assistant"]')).toBeVisible({ timeout: 10000 });

        // Response should grow over time (not appear all at once)
        const getText = async () => {
          const el = page.locator('[data-testid="message-assistant"]').last();
          return await el.textContent() || '';
        };

        const text1 = await getText();
        await page.waitForTimeout(500);
        const text2 = await getText();

        // Text should be longer after 500ms (streaming)
        expect(text2.length).toBeGreaterThan(text1.length);
      });

      test('first token appears within 500ms', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('[data-testid="chat-input"]');

        const startTime = Date.now();

        await page.fill('[data-testid="chat-input"]', 'Hi');
        await page.click('[data-testid="send-button"]');

        // Wait for first content in assistant message
        await expect(page.locator('[data-testid="message-assistant"]')).toBeVisible({ timeout: 500 });

        const firstTokenTime = Date.now() - startTime;
        console.log(`First token latency: ${firstTokenTime}ms`);

        // Note: This may not pass 100% of the time due to network variance
        // For CI, consider using a more lenient threshold or mocking
      });

      test('long response streams smoothly (1000+ tokens)', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('[data-testid="chat-input"]');

        await page.fill(
          '[data-testid="chat-input"]',
          'Write a detailed 500-word explanation of how computers work.',
        );
        await page.click('[data-testid="send-button"]');

        // Wait for response to complete
        await expect(page.locator('[data-testid="send-button"]')).toBeVisible({ timeout: 60000 });

        // Check final content length
        const content = await page.locator('[data-testid="message-assistant"]').last().textContent();
        expect(content?.length).toBeGreaterThan(500);
      }, 90000);

      test('can cancel streaming', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('[data-testid="chat-input"]');

        await page.fill(
          '[data-testid="chat-input"]',
          'Write a very long story about a robot.',
        );
        await page.click('[data-testid="send-button"]');

        // Wait for streaming to start
        await expect(page.locator('[data-testid="cancel-button"]')).toBeVisible();

        // Cancel
        await page.click('[data-testid="cancel-button"]');

        // Should return to normal state
        await expect(page.locator('[data-testid="send-button"]')).toBeVisible();
      });
    });
    ```
  - [x] 17.2 Test typing indicator lifecycle
  - [x] 17.3 Test smooth streaming rendering
  - [x] 17.4 Test long response handling
  - [x] 17.5 Test cancel functionality

---

## Dev Notes

### Critical Architecture Constraints

| Constraint | Requirement | Source |
|------------|-------------|--------|
| Streaming Protocol | SSE (Server-Sent Events) | ARCH-023 |
| IPC Streaming | Tauri events | ARCH-024 |
| First Token Latency | <500ms p95 | NFR-P001 |
| Real-time Streaming | True | NFR-P002 |
| Agent Server Port | localhost:3001 | ARCH-005 |
| Claude SDK | @anthropic-ai/sdk with streaming | architecture.md#3.3 |

### SSE Event Format

Events follow this format:
```
event: <event-type>
data: {"key": "value", ...}

```

Event types:
- `connected` - Stream initialized
- `text` - Text token
- `thinking` - Extended thinking content (future)
- `tool_start` - Tool execution started
- `tool_complete` - Tool execution finished
- `complete` - Stream finished with token counts
- `error` - Error occurred

### Data Flow

```
User Input
    |
    v
Frontend (React) --sendMessageStreaming()--> Chat Store
    |
    v
Chat Store --invoke('start_agent_stream')--> Tauri Rust Command
    |
    v
Tauri Rust --HTTP POST--> Agent Server (:3001/api/stream/start)
    |
    v
Agent Server --client.messages.stream()--> Claude API
    |
    v
Claude API ==SSE==> Agent Server
    |
    v
Agent Server ==SSE Response==> Tauri Rust
    |
    v
Tauri Rust --app.emit('agent:stream:xxx')--> Frontend
    |
    v
Frontend (listen) --> Chat Store --> UI Update
```

### Directory Structure for This Story

```
agent-server/
├── src/
│   ├── services/
│   │   └── claude-client.ts      # MODIFY: Add streaming method
│   └── routes/
│       └── stream.ts             # MODIFY: Replace placeholder with real SSE

src/
├── types/
│   └── streaming.ts              # CREATE: Stream event types
├── lib/
│   ├── services/
│   │   └── streamingService.ts   # CREATE: Frontend streaming service
│   └── performance/
│       └── streamMetrics.ts      # CREATE: Performance tracking
├── hooks/
│   └── useAutoScroll.ts          # CREATE: Auto-scroll hook
├── stores/
│   └── chatStore.ts              # MODIFY: Add streaming state/actions
└── components/
    └── chat/
        ├── TypingIndicator.tsx   # CREATE: Typing dots
        ├── StreamingText.tsx     # CREATE: Text with cursor
        ├── MessageList.tsx       # MODIFY: Add auto-scroll
        ├── MessageBubble.tsx     # MODIFY: Support streaming
        └── ChatInput.tsx         # MODIFY: Use streaming, add cancel

src-tauri/src/
├── main.rs                       # MODIFY: Register stream_forwarder
└── stream_forwarder.rs           # CREATE: Tauri IPC streaming

tests/
├── unit/
│   └── components/
│       ├── TypingIndicator.test.tsx    # CREATE
│       └── StreamingText.test.tsx      # CREATE
├── integration/
│   └── streaming/
│       └── sse-endpoint.test.ts        # CREATE
└── e2e/
    └── streaming.spec.ts               # CREATE
```

### Dependencies

**No new npm dependencies required** - uses existing `@anthropic-ai/sdk` streaming support.

**Rust dependencies already added in Story 1.5:**
```toml
reqwest = { version = "0.12", features = ["stream"] }
futures-util = "0.3"
```

### Project Structure Notes

- **Dependency:** Story 1.5 (Agent Server Process) MUST be complete - provides server infrastructure and SSE stub
- **Dependency:** Story 1.7 (Claude Integration) MUST be complete - provides ClaudeClient base class
- **Dependency:** Story 1.6 (Chat Message Storage) MUST be complete - provides message persistence
- **Parallel:** Can run after Story 1.7, alongside Story 1.9 (Split-Screen Layout)
- **Enables:** Story 1.10 (Tool Call Visualization) - will add tool streaming events

### Learnings from Previous Stories

**From Story 1.5 (Agent Server Process):**
- SSE endpoint stub exists at `/api/stream/:streamId`
- SSE headers already defined: `Content-Type: text/event-stream`, `Cache-Control: no-cache`
- Express router structure in place

**From Story 1.7 (Claude Integration):**
- ClaudeClient class exists with `sendMessage` method
- Error handling patterns established (AUTH_ERROR, RATE_LIMITED, etc.)
- Chat store has `sendMessage` action to extend
- Message persistence via `save_assistant_message` Tauri command

**From Story 1.6 (Chat Message Storage):**
- Messages saved with `msg_xxx` ID format
- Token fields available: `input_tokens`, `output_tokens`
- Conversation stats updated on message save

### Testing Standards

| Test Type | Framework | Location | Notes |
|-----------|-----------|----------|-------|
| Unit | Vitest + RTL | `tests/unit/components/*.test.tsx` | Mock store |
| Integration | Vitest | `tests/integration/streaming/*.test.ts` | Requires API key |
| E2E | Vercel Browser Agent | `tests/e2e/streaming.spec.ts` | Full app testing |

**Integration Test Requirements:**
- Set `ANTHROPIC_API_KEY` environment variable
- Agent Server must be running on port 3001
- Tests may incur API costs

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| First token latency | <500ms p95 | `performance.now()` |
| Render frame rate | 60fps | No visible jank |
| Memory stability | No growth | Long response test |
| Token throughput | 20-50 tok/s | streamMetrics |

### Orion Design System Tokens (for Typing Indicator)

| Token | Value | Usage |
|-------|-------|-------|
| `orion-primary` | `#D4AF37` | Bounce dots, streaming cursor |
| `orion-fg/50` | `#1A1A1A 50%` | "Thinking..." text |
| `tracking-editorial` | `0.25em` | Uppercase label tracking |

### Technical Notes

1. **SSE vs WebSocket**
   - SSE is simpler, unidirectional (server->client)
   - Perfect for streaming text (no need for bidirectional)
   - Native browser support via `fetch` + ReadableStream

2. **Tauri Event Forwarding**
   - Agent Server returns SSE to Tauri Rust process
   - Rust parses SSE and emits Tauri events
   - Frontend listens via `@tauri-apps/api/event`

3. **First Token Tracking**
   - Record `streamStartTime` when request sent
   - Record `firstTokenTime` on first `text` event
   - Calculate latency = firstTokenTime - streamStartTime

4. **Auto-Scroll Behavior**
   - Scroll to bottom on new content IF user is at bottom
   - If user scrolls up, pause auto-scroll
   - Show "scroll to bottom" button when paused

5. **Memory Management**
   - Accumulate content in single string, not array
   - Update message in-place (immer handles efficiently)
   - Clear pending content after stream completes

---

### References

- [Source: thoughts/planning-artifacts/architecture.md#12 Streaming Architecture]
- [Source: thoughts/planning-artifacts/architecture.md#7.4 Chat Panel with Streaming]
- [Source: thoughts/planning-artifacts/architecture.md#7.2 Chat Store]
- [Source: thoughts/planning-artifacts/architecture.md#8.3 IPC Event Streaming]
- [Source: thoughts/planning-artifacts/epics.md#Story 1.8: Streaming Responses]
- [Source: thoughts/planning-artifacts/prd.md#5.1.1 Chat Interface (FR-CH003)]
- [Source: thoughts/planning-artifacts/prd.md#6.4 AI Integration]
- [Source: thoughts/implementation-artifacts/stories/story-1-5-agent-server-process.md] (prerequisite)
- [Source: thoughts/implementation-artifacts/stories/story-1-7-claude-integration.md] (prerequisite)

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- All 362 unit tests passing
- Streaming components fully functional

### Completion Notes List

1. **Implementation Status**: All 17 tasks complete. The streaming infrastructure was largely implemented in previous stories (Story 1.5 and 1.7). This session verified the implementation and added comprehensive tests.

2. **Key Components Verified**:
   - SSE streaming endpoint with GET and POST methods
   - Claude Agent SDK with callback-based streaming
   - Tauri IPC stream forwarding via Rust
   - Frontend streaming service with SSE parsing
   - Chat store with streaming state management
   - TypingIndicator, StreamingText, and auto-scroll components
   - Performance metrics tracking

3. **Tests Added**:
   - TypingIndicator.test.tsx: 6 tests for typing indicator state machine
   - StreamingText.test.tsx: 10 tests for streaming text display
   - useAutoScroll.test.ts: 8 tests for auto-scroll hook
   - streamingService.test.ts: 17 tests for SSE parsing and service
   - chatStore.streaming.test.ts: 13 tests for store streaming actions
   - sse-endpoint.test.ts: Integration tests for SSE endpoint
   - story-1.8-streaming.spec.ts: E2E tests for streaming UI

4. **Architecture Notes**:
   - Uses fetch + ReadableStream for SSE consumption (not EventSource)
   - Tauri command `start_agent_stream` forwards events via app.emit()
   - First token latency tracked via performance.now()
   - Auto-scroll pauses when user scrolls up, shows "scroll to bottom" button

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-15 | Story created with comprehensive streaming implementation guide | SM Agent (Bob) |
| 2026-01-16 | Verified implementation, added tests (362 passing) | Dev Agent (Amelia) |

### File List

**Created:**
- `tests/unit/components/chat/TypingIndicator.test.tsx` - Typing indicator tests
- `tests/unit/components/chat/StreamingText.test.tsx` - Streaming text tests
- `tests/unit/hooks/useAutoScroll.test.ts` - Auto-scroll hook tests
- `tests/unit/services/streamingService.test.ts` - Streaming service tests
- `tests/unit/stores/chatStore.streaming.test.ts` - Chat store streaming tests
- `tests/integration/streaming/sse-endpoint.test.ts` - SSE endpoint integration tests
- `tests/e2e/story-1.8-streaming.spec.ts` - E2E streaming tests

**Already Existed (Verified):**
- `agent-server/src/services/claude-client.ts` - Claude client with sendMessageWithCallbacks
- `agent-server/src/routes/stream.ts` - SSE streaming endpoint (GET and POST)
- `agent-server/src/index.ts` - Stream routes registered
- `src/types/streaming.ts` - Stream event types
- `src/lib/services/streamingService.ts` - Frontend streaming service
- `src/lib/performance/streamMetrics.ts` - Performance tracking
- `src/hooks/useAutoScroll.ts` - Auto-scroll hook
- `src/stores/chatStore.ts` - Chat store with streaming state
- `src/components/chat/TypingIndicator.tsx` - Typing indicator component
- `src/components/chat/StreamingText.tsx` - Streaming text component
- `src/components/chat/MessageBubble.tsx` - Message bubble with streaming prop
- `src/components/chat/MessageHistory.tsx` - Message history with auto-scroll
- `src/components/chat/ChatInput.tsx` - Chat input with cancel button
- `src-tauri/src/stream_forwarder.rs` - Tauri IPC stream forwarding
- `src-tauri/src/main.rs` - start_agent_stream command registered
