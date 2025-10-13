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
    <div className="flex min-h-dvh flex-col overflow-y-auto bg-background text-foreground">
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
              <Link href="#cta" aria-label="Start your journey with Syngulr">
                Start Your Journey
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            {/* <Button size="lg" variant="outline" asChild>
              <Link
                href="#why"
                aria-label="Learn more about why Syngulr stands out"
              >
                Explore Why Syngulr
              </Link>
            </Button> */}
          </div>
        </div>
      </header>

      {/* <div className="flex-1">
        <section
          id="what-is-syngulr"
          className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-16 sm:px-8 sm:py-20"
        >
          <Card className="border-border/80 bg-card/80 backdrop-blur">
            <CardHeader className="space-y-4 text-left sm:text-center">
              <CardTitle className="text-3xl font-semibold sm:text-4xl">
                What is Syngulr?
              </CardTitle>
              <CardDescription className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                Syngulr is a revolutionary platform that equips solo builders,
                creators, and innovators with an AI-powered arsenal to launch
                full-scale companies — from idea to execution. Design, develop,
                automate, and deploy — all in one place, without writing a
                single line of code (unless you want to).
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        <section
          id="why"
          className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 sm:px-8 sm:py-20"
        >
          <div className="space-y-4 text-left sm:text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Why Syngulr?
            </h2>
            <p className="text-base text-muted-foreground sm:text-lg">
              Build with confidence using adaptive AI agents, modular workflows,
              and a launch stack engineered for solo operators.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {whyItems.map(({ title, description, icon: Icon }) => (
              <Card
                key={title}
                className="border-border/60 bg-card/90 shadow-lg shadow-border/20 backdrop-blur-sm"
              >
                <CardHeader className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-xl">{title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed text-muted-foreground">
                    {description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section
          id="what-you-can-build"
          className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 sm:px-8 sm:py-20"
        >
          <div className="space-y-3 text-left sm:text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              What You Can Build
            </h2>
            <p className="text-base text-muted-foreground sm:text-lg">
              Ship anything from MVPs to full-fledged companies — powered by a
              personal squad of AI agents.
            </p>
          </div>
          <Card className="border-border/70 bg-card/90 backdrop-blur">
            <CardContent className="grid gap-4 p-6 sm:grid-cols-2 sm:gap-6">
              {buildItems.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2
                    className="mt-1 h-5 w-5 flex-shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <p className="text-base font-medium text-foreground">
                    {item}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section
          id="who-is-it-for"
          className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 sm:px-8 sm:py-20"
        >
          <div className="space-y-3 text-left sm:text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Who is it For?
            </h2>
            <p className="text-base text-muted-foreground sm:text-lg">
              If you’ve ever said, “I just need a team” — you’ve found it.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {personaItems.map(({ title, description }) => (
              <Card
                key={title}
                className="h-full border-border/60 bg-card/90 backdrop-blur"
              >
                <CardHeader className="space-y-3">
                  <CardTitle className="text-xl">{title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed text-muted-foreground">
                    {description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section
          id="core-features"
          className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 sm:px-8 sm:py-20"
        >
          <div className="space-y-3 text-left sm:text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Core Features
            </h2>
            <p className="text-base text-muted-foreground sm:text-lg">
              Everything you need to ideate, build, launch, and grow —
              orchestrated by Syngulr.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featureItems.map(({ title, description, icon: Icon }) => (
              <Card
                key={title}
                className="h-full border-border/60 bg-card/90 shadow-lg shadow-border/15 backdrop-blur-sm"
              >
                <CardHeader className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-xl">{title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed text-muted-foreground">
                    {description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section
          id="testimonials"
          className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 sm:px-8 sm:py-20"
        >
          <div className="space-y-3 text-left sm:text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              What Users Say
            </h2>
            <p className="text-base text-muted-foreground sm:text-lg">
              Real builders, real results — powered by Syngulr&apos;s AI
              workforce.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {testimonials.map(({ quote, name, role }) => (
              <Card
                key={name}
                className="h-full border-border/60 bg-card/95 backdrop-blur"
              >
                <CardContent className="flex h-full flex-col gap-6 p-6">
                  <blockquote className="text-lg font-medium leading-relaxed text-foreground">
                    “{quote}”
                  </blockquote>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-foreground">{name}</p>
                    <p className="text-muted-foreground">{role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section
          id="cta"
          className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-20 sm:px-8"
        >
          <Card className="border-transparent bg-primary text-primary-foreground">
            <CardContent className="flex flex-col gap-8 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4 text-left">
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Ready to Build Solo?
                </h2>
                <p className="text-base sm:text-lg">
                  Sign up now and experience the power of building without
                  limits.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/flow" aria-label="Start building with Syngulr">
                    Start Your Journey
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#join" aria-label="Subscribe to Syngulr updates">
                    Stay in the Loop
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section
          id="join"
          className="mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-20 sm:px-8 sm:pb-24"
        >
          <Card className="border-border/70 bg-card/90 backdrop-blur">
            <CardContent className="flex flex-col gap-6 p-6 sm:p-10">
              <div className="space-y-3 text-left sm:text-center">
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Join the Syngulr Circle
                </h2>
                <p className="text-base text-muted-foreground sm:text-lg">
                  Stay ahead of the curve with updates, drop-ins, new agent
                  launches, and tutorials.
                </p>
              </div>
              <form className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex w-full flex-col gap-2 sm:max-w-md">
                  <Label htmlFor="email" className="sr-only">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="h-12"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 sm:self-stretch"
                >
                  Subscribe to Updates
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>

      <footer className="border-t border-border bg-card/80 px-6 py-8 text-sm text-muted-foreground sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p>© 2025 Syngulr Technologies. Built for the Singular You.</p>
          <div className="flex gap-6">
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
          </div>
        </div>
      </footer> */}
    </div>
  );
}
