"use client";

import type { Task } from "@/types/sprinter";
import { cn } from "@/lib/utils";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function positionPercent(
  taskStart: Date | undefined,
  taskEnd: Date | undefined,
  rangeStart: Date,
  rangeEnd: Date
) {
  const start = taskStart ?? rangeStart;
  const end = taskEnd ?? start;
  const total = rangeEnd.getTime() - rangeStart.getTime();
  if (total <= 0) return { left: 0, width: 0 };
  const left = ((start.getTime() - rangeStart.getTime()) / total) * 100;
  const right = ((rangeEnd.getTime() - end.getTime()) / total) * 100;
  const width = 100 - clamp(left, 0, 100) - clamp(right, 0, 100);
  return { left: clamp(left, 0, 100), width: clamp(width, 0, 100) };
}

export function TimelineTaskBar(props: {
  task: Task;
  startDate: Date;
  endDate: Date;
}) {
  const { task, startDate, endDate } = props;
  const { left, width } = positionPercent(
    task.startDate,
    task.endDate,
    startDate,
    endDate
  );

  const statusColors: Record<Task["status"], string> = {
    todo: "bg-slate-400",
    "in-progress": "bg-blue-500",
    testing: "bg-yellow-500",
    completed: "bg-green-500",
  };

  return (
    <div
      className={cn(
        "absolute h-6 cursor-pointer rounded-md transition-all hover:opacity-80",
        statusColors[task.status]
      )}
      style={{ left: `${left}%`, width: `${width}%` }}
      title={`${task.title} - ${task.status}`}
    >
      <div className="truncate px-2 py-1 text-xs text-white">{task.title}</div>
    </div>
  );
}
