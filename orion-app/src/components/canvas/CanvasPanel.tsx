"use client";

import { useChatStore, CanvasMode } from "@/stores/chat-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Mail,
  Calendar,
  ClipboardList,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

const modeConfig: Record<
  CanvasMode,
  { icon: React.ElementType; label: string; description: string }
> = {
  empty: {
    icon: LayoutGrid,
    label: "Canvas",
    description: "Select a mode or let the agent populate content",
  },
  briefing: {
    icon: FileText,
    label: "Daily Briefing",
    description: "Your day at a glance",
  },
  email: {
    icon: Mail,
    label: "Email Composer",
    description: "Compose and edit emails",
  },
  calendar: {
    icon: Calendar,
    label: "Calendar",
    description: "View and manage your schedule",
  },
  form: {
    icon: ClipboardList,
    label: "Form",
    description: "Fill out forms and questionnaires",
  },
  "task-list": {
    icon: ClipboardList,
    label: "Tasks",
    description: "Manage your task list",
  },
};

function EmptyCanvas() {
  const { setCanvasMode } = useChatStore();

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Canvas</h2>
        <p className="text-muted-foreground">
          The canvas displays dynamic content based on your conversation.
          <br />
          Ask Orion to show your calendar, compose an email, or view tasks.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md">
        {(["briefing", "email", "calendar", "task-list"] as CanvasMode[]).map(
          (mode) => {
            const config = modeConfig[mode];
            const Icon = config.icon;
            return (
              <Button
                key={mode}
                variant="outline"
                className="h-auto flex flex-col items-center gap-2 p-4"
                onClick={() => setCanvasMode(mode)}
              >
                <Icon className="h-6 w-6" />
                <span>{config.label}</span>
              </Button>
            );
          }
        )}
      </div>
    </div>
  );
}

function BriefingCanvas() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-semibold">Daily Briefing</h2>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Calendar integration coming in Phase 4
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Priority Inbox</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Inbox triage coming in Phase 7
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tasks Due</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Task management coming in Phase 8
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmailCanvas() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Email Composer</h2>
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center py-8">
            TipTap email editor coming in Phase 6 (A2UI Canvas)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function CalendarCanvas() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Calendar</h2>
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center py-8">
            Calendar view coming in Phase 4 (Composio Integration)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function TaskListCanvas() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Tasks</h2>
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center py-8">
            Task board coming in Phase 8 (PARA Structure)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function FormCanvas() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Form</h2>
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center py-8">
            Dynamic forms coming in Phase 6 (A2UI Canvas)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

const canvasComponents: Record<CanvasMode, React.ComponentType> = {
  empty: EmptyCanvas,
  briefing: BriefingCanvas,
  email: EmailCanvas,
  calendar: CalendarCanvas,
  form: FormCanvas,
  "task-list": TaskListCanvas,
};

export function CanvasPanel() {
  const { canvasMode, setCanvasMode } = useChatStore();
  const config = modeConfig[canvasMode];
  const CanvasContent = canvasComponents[canvasMode];

  return (
    <div className="flex flex-col h-full bg-muted/30">
      {canvasMode !== "empty" && (
        <div className="border-b bg-background px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <config.icon className="h-4 w-4" />
            <span className="font-semibold">{config.label}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCanvasMode("empty")}
          >
            Clear
          </Button>
        </div>
      )}
      <div className="flex-1 overflow-auto">
        <CanvasContent />
      </div>
    </div>
  );
}
