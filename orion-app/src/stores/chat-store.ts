import { create } from "zustand";

export type CanvasMode = "empty" | "briefing" | "email" | "calendar" | "form" | "task-list";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
  isStreaming?: boolean;
}

export interface ToolCall {
  id: string;
  name: string;
  status: "pending" | "running" | "success" | "error";
  result?: unknown;
}

interface ChatState {
  messages: Message[];
  isAgentThinking: boolean;
  canvasMode: CanvasMode;
  canvasData: unknown | null;
  isCanvasVisible: boolean;
}

interface ChatActions {
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  setAgentThinking: (thinking: boolean) => void;
  setCanvasMode: (mode: CanvasMode, data?: unknown) => void;
  toggleCanvas: () => void;
  clearMessages: () => void;
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isAgentThinking: false,
  canvasMode: "empty",
  canvasData: null,
  isCanvasVisible: true,

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        },
      ],
    })),

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    })),

  setAgentThinking: (thinking) => set({ isAgentThinking: thinking }),

  setCanvasMode: (mode, data = null) =>
    set({ canvasMode: mode, canvasData: data }),

  toggleCanvas: () =>
    set((state) => ({ isCanvasVisible: !state.isCanvasVisible })),

  clearMessages: () => set({ messages: [] }),
}));
