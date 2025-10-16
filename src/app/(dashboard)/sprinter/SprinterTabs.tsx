"use client";

import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Board = dynamic(() => import("./components/Board").then((m) => m.Board), {
  ssr: false,
});

const Timeline = dynamic(
  () =>
    import("./components/InteractiveTimeline").then(
      (m) => m.InteractiveTimeline
    ),
  { ssr: false }
);

export function SprinterTabs() {
  return (
    <Tabs defaultValue="board" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="board" className="gap-2">
          Tablero
        </TabsTrigger>
        <TabsTrigger value="timeline" className="gap-2">
          Línea de Tiempo
        </TabsTrigger>
      </TabsList>

      <TabsContent value="board" className="mt-0">
        <Board />
      </TabsContent>

      <TabsContent value="timeline" className="mt-0">
        <Timeline />
      </TabsContent>
    </Tabs>
  );
}
