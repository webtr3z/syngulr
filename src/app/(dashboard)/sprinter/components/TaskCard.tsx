"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { useSprinterStore } from "../store/sprinter-store";
import type { Task } from "@/types/sprinter";

export function TaskCard({ task }: { task: Task }) {
  const deleteTask = useSprinterStore((s) => s.deleteTask);

  return (
    <Card className="group relative">
      <CardHeader className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-sm font-medium">
              {task.title}
            </CardTitle>
            <Badge variant="outline" className="mt-1 text-xs">
              {task.type}
            </Badge>
          </div>

          <Button
            aria-label="Eliminar tarea"
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => deleteTask(task.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>

      {task.description && (
        <CardContent className="p-3 pt-0">
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {task.description}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
