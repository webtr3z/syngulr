"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Workflow } from "lucide-react";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <ThemeProvider enableSystem disableTransitionOnChange>
      <div className="flex min-h-screen flex-col bg-transparent text-foreground">
        <header className="border-b border-border bg-transparent">
          <div className="mx-auto flex w-full items-center justify-between px-6 py-4 sm:px-8">
            <Link
              href="/"
              className="flex items-center gap-3 text-sm font-semibold tracking-tight transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Workflow className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-lg">Syngulr</span>
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
      <Toaster richColors />
    </ThemeProvider>
  );
}
