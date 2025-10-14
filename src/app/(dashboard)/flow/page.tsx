import type { Metadata } from "next";

import FlowCanvas from "./FlowCanvas";

export const metadata: Metadata = {
  title: "Editor de diagramas de flujo",
  description: "Crea, conecta y organiza las cajas de tu flujo.",
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
