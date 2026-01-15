"use client";

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { CanvasPanel } from "@/components/canvas/CanvasPanel";
import { useChatStore } from "@/stores/chat-store";

export function AppLayout() {
  const { isCanvasVisible } = useChatStore();

  return (
    <div className="h-full">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize={35} minSize={25} maxSize={60}>
          <ChatPanel />
        </ResizablePanel>
        {isCanvasVisible && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={65} minSize={30}>
              <CanvasPanel />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
