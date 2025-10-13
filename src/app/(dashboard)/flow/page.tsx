import type { Metadata } from "next";

import FlowCanvas from "./FlowCanvas";

export const metadata: Metadata = {
  title: "Flowchart Editor",
  description: "Create, connect, and organize flowchart boxes.",
};

export default function FlowPage() {
  return (
    <div className="relative flex h-dvh w-full flex-col bg-background text-foreground">
      <div className="flex-1">
        <FlowCanvas />
      </div>
    </div>
  );
}
