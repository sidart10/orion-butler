/**
 * Mock Server for k6 Performance Testing
 *
 * Simulates Claude API streaming responses for baseline performance testing.
 * Designed to validate SLO thresholds defined in NFR-1.
 *
 * Timing Configuration:
 * - FIRST_TOKEN_DELAY: 100ms (well under 500ms SLO)
 * - TOKEN_INTERVAL: 20ms between tokens
 * - TOKENS_PER_RESPONSE: 50 tokens (~1000ms total response)
 * - TOOL_CALL_DELAY: 500ms (under 2000ms SLO)
 * - ERROR_RATE: 0.5% (under 1% SLO)
 *
 * Usage:
 * ```bash
 * npx tsx tests/performance/mock-server.ts
 * # Server starts on http://localhost:3456
 * ```
 *
 * @see tests/performance/README.md for full documentation
 * @see thoughts/planning-artifacts/nfr-extracted-from-prd-v2.md#NFR-1.1
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';

// ============================================================================
// Configuration Constants
// ============================================================================

/** First token delay in ms - well under 500ms SLO (NFR-1.1) */
const FIRST_TOKEN_DELAY = 100;

/** Interval between tokens in ms */
const TOKEN_INTERVAL = 20;

/** Number of tokens per response (~1000ms total response time) */
const TOKENS_PER_RESPONSE = 50;

/** Tool call processing delay in ms - under 2000ms SLO (NFR-1.3) */
const TOOL_CALL_DELAY = 500;

/** Error injection rate - under 1% SLO (NFR-2.4) */
const ERROR_RATE = 0.005;

/** Default server port */
const DEFAULT_PORT = 3456;

// ============================================================================
// Type Definitions
// ============================================================================

interface ClaudeMessageRequest {
  model?: string;
  messages?: Array<{ role: string; content: string }>;
  stream?: boolean;
  scenario?: 'simple_query' | 'tool_call' | 'error_injection';
}

interface StreamEvent {
  type: string;
  index?: number;
  delta?: {
    type?: string;
    text?: string;
  };
  content_block?: {
    type: string;
    text?: string;
  };
  message?: {
    id: string;
    type: string;
    role: string;
    model: string;
  };
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Sleep for specified milliseconds
 */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate a unique message ID
 */
const generateMessageId = (): string =>
  `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

/**
 * Format SSE event
 */
const formatSSE = (data: StreamEvent): string =>
  `event: ${data.type}\ndata: ${JSON.stringify(data)}\n\n`;

// ============================================================================
// Response Generators
// ============================================================================

/**
 * Generate streaming response for simple query scenario
 */
async function streamSimpleQuery(res: ServerResponse): Promise<void> {
  const messageId = generateMessageId();

  // Message start event
  res.write(
    formatSSE({
      type: 'message_start',
      message: {
        id: messageId,
        type: 'message',
        role: 'assistant',
        model: 'claude-sonnet-4-20250514',
      },
    })
  );

  // First token delay - this is the key SLO metric
  await sleep(FIRST_TOKEN_DELAY);

  // Content block start
  res.write(
    formatSSE({
      type: 'content_block_start',
      index: 0,
      content_block: {
        type: 'text',
        text: '',
      },
    })
  );

  // Stream tokens
  for (let i = 0; i < TOKENS_PER_RESPONSE; i++) {
    await sleep(TOKEN_INTERVAL);
    res.write(
      formatSSE({
        type: 'content_block_delta',
        index: 0,
        delta: {
          type: 'text_delta',
          text: `token_${i} `,
        },
      })
    );
  }

  // Content block stop
  res.write(
    formatSSE({
      type: 'content_block_stop',
      index: 0,
    })
  );

  // Message delta with stop reason
  res.write(
    formatSSE({
      type: 'message_delta',
      delta: {
        type: 'message_delta',
      },
      usage: {
        input_tokens: 10,
        output_tokens: TOKENS_PER_RESPONSE,
      },
    })
  );

  // Message stop
  res.write(
    formatSSE({
      type: 'message_stop',
    })
  );
}

/**
 * Generate streaming response with tool call for tool_call scenario
 */
async function streamToolCall(res: ServerResponse): Promise<void> {
  const messageId = generateMessageId();

  // Message start event
  res.write(
    formatSSE({
      type: 'message_start',
      message: {
        id: messageId,
        type: 'message',
        role: 'assistant',
        model: 'claude-sonnet-4-20250514',
      },
    })
  );

  // First token delay
  await sleep(FIRST_TOKEN_DELAY);

  // Tool use content block start
  res.write(
    formatSSE({
      type: 'content_block_start',
      index: 0,
      content_block: {
        type: 'tool_use',
      },
    })
  );

  // Simulate tool processing delay - this is the tool invocation SLO metric
  await sleep(TOOL_CALL_DELAY);

  // Tool use content block stop
  res.write(
    formatSSE({
      type: 'content_block_stop',
      index: 0,
    })
  );

  // Text response after tool
  res.write(
    formatSSE({
      type: 'content_block_start',
      index: 1,
      content_block: {
        type: 'text',
        text: '',
      },
    })
  );

  // Stream some tokens after tool call
  for (let i = 0; i < 10; i++) {
    await sleep(TOKEN_INTERVAL);
    res.write(
      formatSSE({
        type: 'content_block_delta',
        index: 1,
        delta: {
          type: 'text_delta',
          text: `result_${i} `,
        },
      })
    );
  }

  res.write(
    formatSSE({
      type: 'content_block_stop',
      index: 1,
    })
  );

  res.write(
    formatSSE({
      type: 'message_stop',
    })
  );
}

// ============================================================================
// Request Handler
// ============================================================================

/**
 * Handle incoming HTTP requests
 */
async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  // CORS headers for k6
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, anthropic-version');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Only handle POST /v1/messages
  if (req.method !== 'POST' || req.url !== '/v1/messages') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  // Random error injection
  if (Math.random() < ERROR_RATE) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        type: 'error',
        error: {
          type: 'api_error',
          message: 'Simulated internal server error for SLO testing',
        },
      })
    );
    return;
  }

  // Parse request body
  let body = '';
  for await (const chunk of req) {
    body += chunk;
  }

  let request: ClaudeMessageRequest = {};
  try {
    request = JSON.parse(body) as ClaudeMessageRequest;
  } catch {
    // Default to simple query if body is invalid
  }

  // Determine scenario from request
  const scenario = request.scenario || 'simple_query';

  // Set up streaming response
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  try {
    if (scenario === 'tool_call') {
      await streamToolCall(res);
    } else {
      await streamSimpleQuery(res);
    }
  } catch (error) {
    // Handle stream errors gracefully
    res.write(
      formatSSE({
        type: 'error',
        delta: {
          type: 'error',
          text: error instanceof Error ? error.message : 'Unknown error',
        },
      })
    );
  }

  res.end();
}

// ============================================================================
// Server Export & Startup
// ============================================================================

/**
 * Create and return the mock server instance
 */
export function createMockServer(port: number = DEFAULT_PORT) {
  const server = createServer(handleRequest);

  return {
    server,
    start: () => {
      return new Promise<void>((resolve) => {
        server.listen(port, () => {
          console.log(`[Mock Server] Claude API mock running on http://localhost:${port}`);
          console.log(`[Mock Server] Endpoint: POST /v1/messages`);
          console.log(`[Mock Server] Configuration:`);
          console.log(`  - First token delay: ${FIRST_TOKEN_DELAY}ms (SLO: <500ms)`);
          console.log(`  - Tool call delay: ${TOOL_CALL_DELAY}ms (SLO: <2000ms)`);
          console.log(`  - Error rate: ${ERROR_RATE * 100}% (SLO: <1%)`);
          resolve();
        });
      });
    },
    stop: () => {
      return new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    },
  };
}

/**
 * Export configuration for tests
 */
export const mockServerConfig = {
  FIRST_TOKEN_DELAY,
  TOKEN_INTERVAL,
  TOKENS_PER_RESPONSE,
  TOOL_CALL_DELAY,
  ERROR_RATE,
  DEFAULT_PORT,
};

// Start server if run directly
if (require.main === module || process.argv[1]?.includes('mock-server')) {
  const port = parseInt(process.env.PORT || String(DEFAULT_PORT), 10);
  const mockServer = createMockServer(port);
  mockServer.start();

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n[Mock Server] Shutting down...');
    await mockServer.stop();
    process.exit(0);
  });
}
