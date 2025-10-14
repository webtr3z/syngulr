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
  title: "Syngulr | One Mind. Infinite Tools.",
  description:
    "Unlock the power of AI agents to build your entire startup solo. Design, develop, automate, and launch with Syngulr.",
};

const whyItems: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    title: "Agent-Powered Intelligence",
    description:
      "Tap into autonomous AI flows that think, plan, and act like a full-stack team.",
    icon: Brain,
  },
  {
    title: "Start to Launch in One Stack",
    description:
      "Go from raw concept to deployed product, website, marketing, and growth automation — all solo.",
    icon: Rocket,
  },
  {
    title: "No-Code, Low-Code & Full Control",
    description:
      "Whether you're a thinker, tinkerer, or coder, Syngulr adapts to your workflow.",
    icon: SlidersHorizontal,
  },
  {
    title: "Scalable & Modular",
    description:
      "Plug in or unplug features like APIs, branding kits, LLM orchestration, analytics, CRM, and more.",
    icon: Layers,
  },
];

const buildItems = [
  "AI-first Startups",
  "MVPs and Product Demos",
  "Solo Agencies and Freelance Systems",
  "Marketing Engines and Funnels",
  "Entire SaaS products",
  "Personal Brands with AI backends",
];

const personaItems = [
  {
    title: "Solo Founders",
    description:
      "Launch faster without waiting on a team — your AI collaborators handle the heavy lifting.",
  },
  {
    title: "Developers & Indie Hackers",
    description:
      "Prototype, iterate, and deploy ideas with an AI stack that keeps pace with your inspiration.",
  },
  {
    title: "Creators & Makers",
    description:
      "Spin up branded experiences, content engines, and digital products that feel bespoke.",
  },
  {
    title: "Tech-savvy Hustlers",
    description:
      "Automate growth, ship experiments, and stay on top of every workflow with modular agents.",
  },
  {
    title: "AI Explorers & Prompt Engineers",
    description:
      "Design, orchestrate, and test autonomous flows that go far beyond chat prompts.",
  },
];

const featureItems: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    title: "Autonomous AI Agent Workflows",
    description:
      "Coordinate specialized agents that strategize, build, and deliver outcomes around the clock.",
    icon: Workflow,
  },
  {
    title: "Modular Tool Builder",
    description:
      "Compose AI tools, APIs, and automations into a single command center tailored to your venture.",
    icon: Wrench,
  },
  {
    title: "Plug-and-Play Templates",
    description:
      "Choose from launch-ready blueprints that cover landing pages, apps, funnels, and more.",
    icon: Puzzle,
  },
  {
    title: "Dashboard for Managing Agents & Output",
    description:
      "Monitor every workflow, approve deliverables, and keep your AI workforce aligned.",
    icon: LayoutDashboard,
  },
  {
    title: "Productization Pipelines",
    description:
      "Move from idea to website to launch with built-in operations for shipping your product.",
    icon: Package,
  },
  {
    title: "Auto-branding, Copy & Growth Tools",
    description:
      "Generate cohesive visuals, messaging, and campaigns that resonate with your audience.",
    icon: Globe,
  },
];

const testimonials = [
  {
    quote:
      "With Syngulr, I prototyped, branded, and launched my product in 3 days. Solo.",
    name: "Aria R.",
    role: "Creator & Tech Founder",
  },
  {
    quote: "It’s like having a full remote team of AI agents that never sleep.",
    name: "Niko G.",
    role: "Indie Hacker",
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
        <div className="flex max-w-6xl flex-col gap-10 px-6 pb-20 pt-24 text-left sm:px-8 sm:pt-28 lg:pt-4">
          {/* <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
            One Mind. Infinite Tools.
          </span> */}
          <div className="space-y-6">
            <h1 className="text-4xl font-normal tracking-tight sm:text-5xl lg:text-9xl">
              Be the founder, the team, and the launch — Syngulr makes one mind
              infinite.
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
              <Link href="/flow" aria-label="Start your journey with Syngulr">
                Start Your Journey
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <footer className="border-t border-borde px-6 py-8 text-sm text-muted-foreground sm:px-8">
        <div className="flex w-full flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p>© 2025 Syngulr Technologies. Built for the Singular You.</p>
          {/* <div className="flex gap-6">
            <Link
              href="#what-is-syngulr"
              className="transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              About
            </Link>
            <Link
              href="#core-features"
              className="transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Features
            </Link>
            <Link
              href="#join"
              className="transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Updates
            </Link>
          </div> */}
        </div>
      </footer>
    </div>
  );
}
