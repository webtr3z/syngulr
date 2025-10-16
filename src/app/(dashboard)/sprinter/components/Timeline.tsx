"use client";

import { useMemo, useState } from "react";
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSprinterStore } from "../store/sprinter-store";
import { TimelineTaskBar } from "./TimelineTaskBar";

type ViewMode = "day" | "week" | "month";

export function Timeline() {
  const tasks = useSprinterStore((s) => s.tasks);
  const [anchor, setAnchor] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");

  const { start, end, segments, formatLabel } = useMemo(() => {
    if (viewMode === "day") {
      const start = new Date(
        anchor.getFullYear(),
        anchor.getMonth(),
        anchor.getDate()
      );
      const end = addDays(start, 1);
      const segments = [start];
      const formatLabel = (d: Date) => format(d, "dd MMM");
      return { start, end, segments, formatLabel };
    }
    if (viewMode === "week") {
      const start = startOfWeek(anchor, { weekStartsOn: 1 });
      const end = endOfWeek(anchor, { weekStartsOn: 1 });
      const segments = Array.from({ length: 7 }).map((_, i) =>
        addDays(start, i)
      );
      const formatLabel = (d: Date) => format(d, "EEE dd");
      return { start, end, segments, formatLabel };
    }
    const start = startOfMonth(anchor);
    const end = endOfMonth(anchor);
    const days = end.getDate();
    const segments = Array.from({ length: days }).map(
      (_, i) => new Date(start.getFullYear(), start.getMonth(), i + 1)
    );
    const formatLabel = (d: Date) => format(d, "dd MMM");
    return { start, end, segments, formatLabel };
  }, [anchor, viewMode]);

  const handlePrev = () => {
    setAnchor((d) =>
      viewMode === "day"
        ? addDays(d, -1)
        : viewMode === "week"
        ? addWeeks(d, -1)
        : addMonths(d, -1)
    );
  };
  const handleNext = () => {
    setAnchor((d) =>
      viewMode === "day"
        ? addDays(d, +1)
        : viewMode === "week"
        ? addWeeks(d, +1)
        : addMonths(d, +1)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={viewMode === "day" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("day")}
          >
            Día
          </Button>
          <Button
            variant={viewMode === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("week")}
          >
            Semana
          </Button>
          <Button
            variant={viewMode === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("month")}
          >
            Mes
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <div className="flex border-b">
          {segments.map((seg, i) => (
            <div
              key={i}
              className="min-w-[100px] flex-1 border-r p-2 text-center text-xs font-medium"
            >
              {formatLabel(seg)}
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {tasks.map((task) => (
            <div key={task.id} className="flex h-12 items-center border-b">
              <div className="min-w-[200px] truncate border-r p-2 text-sm font-medium">
                {task.title}
                <Badge variant="outline" className="ml-2 text-xs">
                  {task.status}
                </Badge>
              </div>

              <div className="relative flex-1">
                <TimelineTaskBar task={task} startDate={start} endDate={end} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
