import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Syngulr | Una mente. Herramientas infinitas.",
  description:
    "Desbloquea el poder de los agentes de IA para construir tu startup en solitario. Diseña, desarrolla, automatiza y lanza con Syngulr.",
};

export default function HomePage() {
  return (
    <div className="flex min-h-(100dvh-40px) flex-col overflow-y-auto bg-background text-foreground">
      <header className="relative isolate overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 -z-10 h-full"
          aria-hidden="true"
        />
        <div className="flex max-w-[70%] flex-col gap-10 px-6 pb-20 pt-24 text-left sm:px-8 sm:pt-28 lg:pt-4">
          {/* <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
            One Mind. Infinite Tools.
          </span> */}
          <div className="space-y-6">
            <h1 className="text-4xl font-normal tracking-tight sm:text-5xl lg:text-9xl">
              Sé la persona fundadora, el equipo y el lanzamiento — Syngulr
              vuelve infinita una sola mente.
            </h1>
            {/* <p className="mx-auto max-w-3xl text-base text-muted-foreground sm:text-lg">
              Syngulr equips solo builders, creators, and innovators with an
              AI-powered arsenal to launch full-scale companies from idea to
              execution — design, develop, automate, and deploy without writing
              a single line of code (unless you want to).
            </p> */}
          </div>
          <div className="flex flex-col items-center justify-start gap-3 sm:flex-row">
            <Button size="lg" asChild className="h-[56px]">
              <Link href="/flow" aria-label="Comienza tu viaje con Syngulr">
                Comienza tu viaje
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <footer className="border-t border-borde px-6 py-8 text-sm text-muted-foreground sm:px-8">
        <div className="flex w-full flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p>© 2025 Syngulr Technologies. Diseñado para tu singularidad.</p>
          {/* <div className="flex gap-6">
            <Link
              href="#what-is-syngulr"
              className="transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Sobre Syngulr
            </Link>
            <Link
              href="#core-features"
              className="transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Funciones
            </Link>
            <Link
              href="#join"
              className="transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Actualizaciones
            </Link>
          </div> */}
        </div>
      </footer>
    </div>
  );
}
