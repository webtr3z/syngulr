import type { Metadata } from "next";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Resumen general",
  description:
    "Un vistazo rápido a tus diagramas, artefactos y contextos más recientes.",
};

export default function OverviewPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-16">
        <header className="space-y-4 text-center sm:text-left">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Panel general
          </p>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Bienvenida a tu espacio de diseño estratégico
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              Organiza flujos, artefactos y contextos desde un mismo lugar. De aquí puedes saltar a construir diagramas,
              revisar documentación y afinar los sistemas que tus agentes de IA usarán.
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <OverviewCard
            title="Diagramas de flujo"
            description="Visualiza procesos listos para compartir con tus agentes."
            actionLabel="Abrir /flow"
            href="/flow"
          />
          <OverviewCard
            title="Artefactos"
            description="Centraliza prompts, documentos y entregables en un mismo tablero."
            actionLabel="Explorar artefactos"
            href="/artefactos"
          />
          <OverviewCard
            title="Contextos"
            description="Define el conocimiento base que acompaña a tus agentes durante su trabajo."
            actionLabel="Gestionar contextos"
            href="/contexts"
          />
        </div>

        <div className="rounded-xl border border-dashed border-border/80 bg-card/60 p-8 text-center sm:text-left">
          <h2 className="text-2xl font-semibold">¿Lista para construir?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Empieza con un diagrama para definir el camino, documenta cada logro con artefactos y comparte el contexto que tus
            agentes necesitan. Este panel te acompañará durante todo el ciclo de creación.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-start">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/flow">Crear un diagrama</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/artefactos">Ver artefactos</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

interface OverviewCardProps {
  title: string;
  description: string;
  actionLabel: string;
  href: string;
}

function OverviewCard({ title, description, actionLabel, href }: OverviewCardProps) {
  return (
    <article className="group flex h-full flex-col justify-between rounded-xl border border-border/80 bg-card/70 p-6 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="mt-6 w-full justify-start gap-2 px-0 text-sm font-medium text-primary transition group-hover:translate-x-1"
      >
        <Link href={href}>{actionLabel} →</Link>
      </Button>
    </article>
  );
}
