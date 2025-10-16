import { NotionItemsList } from "@/components/notion/NotionItemsList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contextos",
  description: "Gestiona los contextos de trabajo para tus flujos y proyectos.",
};

export default function ContextsPage() {
  return (
    <main className="flex min-h-dvh flex-col gap-8 bg-background px-8 py-10 text-foreground">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Contextos</h1>
        <p className="text-sm text-muted-foreground">
          Aquí podrás gestionar los diferentes contextos de trabajo para tus
          proyectos, configurar variables de entorno y mantener organizada la
          información relevante de cada espacio.
        </p>
      </header>

      <section className="">
        <NotionItemsList databaseId="289459944afa80e8b8afec1218249360" />
      </section>
    </main>
  );
}
