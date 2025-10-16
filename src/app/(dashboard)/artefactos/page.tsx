import type { Metadata } from "next";
import { NotionItemsList } from "@/components/notion/NotionItemsList";

export const metadata: Metadata = {
  title: "Artefactos",
  description:
    "Gestiona los artefactos clave de tus flujos y mantén la documentación al día.",
};

export default function ArtefactosPage() {
  return (
    <main className="flex min-h-dvh flex-col gap-8 bg-background px-8 py-10 text-foreground">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Artefactos</h1>
        <p className="text-sm text-muted-foreground">
          Aquí podrás listar, crear y actualizar los artefactos que acompañan
          tus diagramas. Muy pronto este espacio incluirá un CRUD completo para
          que mantengas toda la documentación sincronizada.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-card/40 p-6 shadow-sm">
        <h2 className="text-lg font-medium text-foreground">Estado actual</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Estamos preparando la base de datos y los flujos de trabajo necesarios
          para que puedas gestionar artefactos sin salir del editor. Si tienes
          ideas o necesidades específicas, compártelas con el equipo para
          priorizarlas en la siguiente iteración.
        </p>
      </section>
    </main>
  );
}
