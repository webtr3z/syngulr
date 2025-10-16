import type { Metadata } from "next";
import { SprinterTabs } from "./SprinterTabs";

export const metadata: Metadata = {
  title: "Sprinter - Gestión de Proyectos",
  description:
    "Sistema de gestión de tareas con tablero Kanban y línea de tiempo",
};

export default function SprinterPage() {
  return (
    <div className="container mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Sprinter
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestiona tus tareas y proyectos de forma visual
        </p>
      </div>

      <SprinterTabs />
    </div>
  );
}
