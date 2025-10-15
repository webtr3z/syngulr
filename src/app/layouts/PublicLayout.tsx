"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Toaster } from "sonner";

import { AnimatedCursor } from "@/components/AnimatedCursor";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      <div className="relative flex w-full min-h-screen flex-col bg-background text-foreground">
        <AnimatedCursor />
        <header className="w-full border-b border-border">
          <div className="flex w-full items-center justify-between px-6 py-4 sm:px-8">
            <Link
              href="/"
              className="flex items-center gap-3 text-sm font-semibold tracking-tight transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-foreground">
                sy
              </span>
              <span className="text-2xl font-medium">syngulr</span>
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button asChild size="sm" className="h-9 px-4">
                <Link href="/auth" aria-label="Conectar tu wallet con Syngulr">
                  Empezar
                </Link>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
      <Toaster richColors />
    </>
  );
}
