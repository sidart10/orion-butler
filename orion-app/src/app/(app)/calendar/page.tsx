"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CalendarPage() {
  return (
    <div className="flex h-full flex-col p-6">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your calendar events will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
