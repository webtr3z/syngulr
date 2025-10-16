"use client";

import { useEffect, useMemo, useRef } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Clock,
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSprinterStore } from "../store/sprinter-store";
import { loadSprinterEvents, saveSprinterEvents } from "@/lib/sprinter-persist";
import type { TaskEvent } from "@/types/sprinter";

function TimelineIcon({ type }: { type: TaskEvent["eventType"] }) {
  const icon = (() => {
    switch (type) {
      case "created":
        return <Plus className="h-4 w-4" />;
      case "moved":
        return <ArrowRight className="h-4 w-4" />;
      case "updated":
        return <Edit className="h-4 w-4" />;
      case "deleted":
        return <Trash2 className="h-4 w-4" />;
      case "status-changed":
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  })();
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-card text-foreground shadow-sm transition-transform duration-200 hover:scale-105">
      {icon}
    </div>
  );
}

function getEventDescription(event: TaskEvent) {
  switch (event.eventType) {
    case "created":
      return `Tarea creada en ${event.details?.to?.toUpperCase()}`;
    case "moved":
      return `Movida de ${event.details?.from?.toUpperCase()} → ${event.details?.to?.toUpperCase()}`;
    case "updated":
      return `Campo "${event.details?.field}" actualizado`;
    case "deleted":
      return `Tarea eliminada de ${event.details?.from?.toUpperCase()}`;
    default:
      return "Cambio registrado";
  }
}

export function InteractiveTimeline() {
  const events = useSprinterStore((s) => s.events);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await loadSprinterEvents();
      if (stored) {
        useSprinterStore.setState({ events: stored });
      }
    })();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      saveSprinterEvents(events);
    }
  }, [events]);

  const sorted = useMemo(
    () =>
      [...events].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
    [events]
  );

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium">No hay eventos registrados</p>
        <p className="text-sm text-muted-foreground">
          Crea, mueve o modifica tareas para ver su historial aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Historial de Cambios</h2>
          <p className="text-sm text-muted-foreground">
            {events.length} evento{events.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Scroll izquierda"
            className="rounded-md border bg-background p-2 text-foreground shadow-sm transition-colors hover:bg-muted"
            onClick={() =>
              scrollerRef.current?.scrollBy({ left: -300, behavior: "smooth" })
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Scroll derecha"
            className="rounded-md border bg-background p-2 text-foreground shadow-sm transition-colors hover:bg-muted"
            onClick={() =>
              scrollerRef.current?.scrollBy({ left: 300, behavior: "smooth" })
            }
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Carril horizontal monocromático con micro animaciones */}
      <div ref={scrollerRef} className="relative overflow-x-auto">
        <div className="flex items-stretch gap-6 pb-2">
          {sorted.map((event, idx) => (
            <div key={event.id} className="relative min-w-[280px] flex-1">
              {idx < sorted.length - 1 && (
                <div className="pointer-events-none absolute left-[1.25rem] top-4 h-[2px] w-[calc(100%+1.5rem)] bg-border" />
              )}

              <div className="relative z-10 flex items-start gap-3">
                <TimelineIcon type={event.eventType} />
                <Card className="group w-full transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-sm font-medium">
                          {event.taskTitle}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {getEventDescription(event)}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {format(event.timestamp, "PPp", { locale: es })}
                      </Badge>
                    </div>
                  </CardHeader>
                  {event.details && (
                    <CardContent className="pb-3 pt-0">
                      <div className="space-y-1 text-[11px] text-muted-foreground">
                        {event.details.field && (
                          <div>
                            <span className="font-medium">Campo:</span>{" "}
                            {event.details.field}
                          </div>
                        )}
                        {event.details.oldValue && (
                          <div>
                            <span className="font-medium">Anterior:</span>{" "}
                            {event.details.oldValue}
                          </div>
                        )}
                        {event.details.newValue && (
                          <div>
                            <span className="font-medium">Nuevo:</span>{" "}
                            {event.details.newValue}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
