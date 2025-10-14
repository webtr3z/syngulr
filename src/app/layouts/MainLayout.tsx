"use client";

import { useState, type ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { MainNav } from "@/components/sidebar/MainNav";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { PanelLeftClose, PanelRightClose } from "lucide-react";
import Link from "next/link";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ThemeProvider enableSystem disableTransitionOnChange>
      <div className="flex min-h-screen bg-background text-foreground">
        <aside
          className={cn(
            "hidden border-r border-border bg-card/80 py-6 shadow-md transition-all duration-200 md:flex md:flex-col",
            collapsed ? "w-16" : "w-64",
          )}
        >
          <div
            className={cn(
              "flex items-center justify-between px-4",
              collapsed && "flex-col gap-3 px-2",
            )}
          >
            <Link
              href="/"
              className={cn(
                "flex items-center gap-3 text-sm font-semibold tracking-tight transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                collapsed && "justify-center gap-0",
              )}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-foreground">
                sy
              </span>
              {!collapsed && <span className="text-2xl font-medium">syngulr</span>}
            </Link>
            <button
              type="button"
              aria-label={collapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
              className={cn(
                "rounded-md border border-border bg-background/70 p-1.5 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                collapsed && "w-full justify-center p-2",
              )}
              onClick={() => setCollapsed((prev) => !prev)}
            >
              {collapsed ? (
                <PanelRightClose className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          </div>
          <MainNav collapsed={collapsed} />
        </aside>
        <main className="flex-1 overflow-hidden bg-background">{children}</main>
      </div>
      <Toaster richColors />
    </ThemeProvider>
  );
}
