import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Globe,
  LayoutDashboard,
  Layers,
  Package,
  Puzzle,
  Rocket,
  SlidersHorizontal,
  Workflow,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Syngulr | Una mente. Herramientas infinitas.",
  description:
    "Desbloquea el poder de los agentes de IA para construir tu startup en solitario. Diseña, desarrolla, automatiza y lanza con Syngulr.",
};

const whyItems: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    title: "Inteligencia impulsada por agentes",
    description:
      "Aprovecha flujos autónomos de IA que piensan, planifican y actúan como un equipo full-stack.",
    icon: Brain,
  },
  {
    title: "De la idea al lanzamiento en un mismo stack",
    description:
      "Pasa de un concepto en bruto a un producto lanzado, con sitio web, marketing y automatizaciones de crecimiento — todo en solitario.",
    icon: Rocket,
  },
  {
    title: "Sin código, low-code y con control total",
    description:
      "Ya seas estratega, creador o desarrollador, Syngulr se adapta a tu forma de trabajar.",
    icon: SlidersHorizontal,
  },
  {
    title: "Escalable y modular",
    description:
      "Activa o desactiva funciones como APIs, branding, orquestación de LLM, analítica, CRM y más.",
    icon: Layers,
  },
];

const buildItems = [
  "Startups diseñadas con IA",
  "MVPs y demos de producto",
  "Agencias en solitario y sistemas freelance",
  "Motores y embudos de marketing",
  "Productos SaaS completos",
  "Marcas personales con backends de IA",
];

const personaItems = [
  {
    title: "Fundadores en solitario",
    description:
      "Lanza más rápido sin esperar a un equipo: tus colaboradores de IA hacen el trabajo pesado.",
  },
  {
    title: "Desarrolladores e indie hackers",
    description:
      "Prototipa, itera y lanza ideas con un stack de IA que sigue tu ritmo creativo.",
  },
  {
    title: "Creadores y makers",
    description:
      "Activa experiencias, motores de contenido y productos digitales con identidad propia.",
  },
  {
    title: "Constructores orientados a resultados",
    description:
      "Automatiza el crecimiento, lanza experimentos y controla cada flujo con agentes modulares.",
  },
  {
    title: "Exploradores de IA e ingenieros de prompts",
    description:
      "Diseña, orquesta y prueba flujos autónomos que van mucho más allá de un simple prompt.",
  },
];

const featureItems: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    title: "Flujos autónomos de agentes IA",
    description:
      "Coordina agentes especializados que planifican, construyen y entregan resultados sin parar.",
    icon: Workflow,
  },
  {
    title: "Constructor modular de herramientas",
    description:
      "Combina herramientas de IA, APIs y automatizaciones en un único centro de control adaptado a tu proyecto.",
    icon: Wrench,
  },
  {
    title: "Plantillas plug-and-play",
    description:
      "Elige planos listos para lanzar que cubren landing pages, apps, funnels y más.",
    icon: Puzzle,
  },
  {
    title: "Panel para gestionar agentes y entregables",
    description:
      "Supervisa cada flujo, aprueba entregables y mantén alineado a tu equipo de IA.",
    icon: LayoutDashboard,
  },
  {
    title: "Pipelines de productización",
    description:
      "Avanza de la idea al sitio web y al lanzamiento con operaciones integradas para entregar tu producto.",
    icon: Package,
  },
  {
    title: "Branding automático, copy y herramientas de crecimiento",
    description:
      "Genera visuales, mensajes y campañas coherentes que conectan con tu audiencia.",
    icon: Globe,
  },
];

const testimonials = [
  {
    quote:
      "Con Syngulr prototipé, construí la marca y lancé mi producto en 3 días. Yo sola.",
    name: "Aria R.",
    role: "Creadora y fundadora tech",
  },
  {
    quote: "Es como tener un equipo remoto de agentes de IA que nunca duerme.",
    name: "Niko G.",
    role: "Indie hacker",
  },
];

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
