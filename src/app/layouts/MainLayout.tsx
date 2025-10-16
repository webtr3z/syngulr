"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { PanelLeftClose, PanelRightClose } from "lucide-react";
import { Toaster } from "sonner";

import { MainNav } from "@/components/sidebar/MainNav";
import { UserWallet } from "@/components/sidebar/UserWallet";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <div className="flex min-h-screen bg-background text-foreground">
        <aside
          className={cn(
            "hidden border-r border-border bg-card/80 py-6 shadow-md transition-all duration-200 md:flex md:flex-col",
            collapsed ? "w-16" : "w-64"
          )}
        >
          <div
            className={cn(
              "flex items-center justify-between px-4",
              collapsed && "flex-col gap-3 px-2"
            )}
          >
            <Link
              href="/"
              className={cn(
                "flex items-center gap-3 text-sm font-semibold tracking-tight transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                collapsed && "justify-center gap-0"
              )}
              aria-label="Ir al inicio"
            >
              <div
                className={cn(
                  "relative flex-shrink-0 transition-all duration-200",
                  collapsed ? "h-8 w-8" : "h-8 w-[151px]"
                )}
              >
                {collapsed ? (
                  <>
                    <Image
                      src="/images/icon.svg"
                      alt="Syngulr"
                      fill
                      className="block object-contain dark:hidden"
                      sizes="32px"
                      priority
                    />
                    <Image
                      src="/images/icon-black.svg"
                      alt="Syngulr"
                      fill
                      className="hidden object-contain dark:block"
                      sizes="32px"
                      priority
                    />
                  </>
                ) : (
                  <>
                    <Image
                      src="/images/logo.svg"
                      alt="Syngulr"
                      fill
                      className="hidden object-contain dark:block"
                      sizes="151px"
                      priority
                    />
                    <Image
                      src="/images/logo-black.svg"
                      alt="Syngulr"
                      fill
                      className="block object-contain dark:hidden"
                      sizes="151px"
                      priority
                    />
                  </>
                )}
              </div>
            </Link>
            <button
              type="button"
              aria-label={
                collapsed ? "Expandir barra lateral" : "Contraer barra lateral"
              }
              className={cn(
                "rounded-md border border-border bg-background/70 p-1.5 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                collapsed && "flex w-full items-center justify-center p-2"
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

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-end gap-4 border-b border-border bg-card/80 px-6 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <UserWallet />
          </header>
          <main className="flex-1 overflow-hidden bg-background">{children}</main>
        </div>
      </div>
      <Toaster richColors />
    </>
  );
}
