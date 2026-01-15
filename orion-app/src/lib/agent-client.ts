// Agent client placeholder
// Will handle communication with Claude CLI via Tauri shell

export interface AgentMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface AgentClient {
  sendMessage(message: string): Promise<AgentMessage>;
  streamMessage(message: string, onChunk: (chunk: string) => void): Promise<void>;
}

// Placeholder implementation
export function createAgentClient(): AgentClient {
  return {
    async sendMessage(message: string): Promise<AgentMessage> {
      // TODO: Implement with Tauri shell command
      console.log("Agent client sendMessage:", message);
      return {
        role: "assistant",
        content: "Agent client not yet implemented",
        timestamp: new Date(),
      };
    },
    async streamMessage(message: string, onChunk: (chunk: string) => void): Promise<void> {
      // TODO: Implement streaming with Tauri
      console.log("Agent client streamMessage:", message);
      onChunk("Agent client not yet implemented");
    },
  };
}
