"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore, Message } from "@/stores/chat-store";
import { cn } from "@/lib/utils";

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.isStreaming && (
          <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
        )}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.toolCalls.map((tool) => (
              <div
                key={tool.id}
                className="text-xs flex items-center gap-2 opacity-70"
              >
                {tool.status === "running" && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                <span>
                  {tool.name}: {tool.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Thinking...</span>
      </div>
    </div>
  );
}

export function ChatPanel() {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, isAgentThinking, addMessage, setAgentThinking } =
    useChatStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAgentThinking]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");

    addMessage({
      role: "user",
      content: userMessage,
    });

    setAgentThinking(true);

    // TODO: Replace with actual agent call
    setTimeout(() => {
      addMessage({
        role: "assistant",
        content: `I received your message: "${userMessage}"\n\nAgent integration coming in Phase 3.`,
      });
      setAgentThinking(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-4 py-3">
        <h2 className="font-semibold">Chat</h2>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <p className="text-lg font-medium">Welcome to Orion</p>
            <p className="text-sm mt-1">
              Start a conversation with your AI butler
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isAgentThinking && <ThinkingIndicator />}
          </div>
        )}
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Cmd+Enter to send)"
            className="flex-1 resize-none min-h-[80px]"
            rows={3}
          />
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isAgentThinking}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" disabled>
              <Mic className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Cmd+Enter to send
        </p>
      </div>
    </div>
  );
}
