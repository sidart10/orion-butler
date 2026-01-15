"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="flex h-full flex-col p-6">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Application settings will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
