"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Archive,
  Home,
  LayoutDashboard,
  Layers,
  Settings,
  Workflow,
} from "lucide-react";
import { UserWallet } from "./UserWallet";

const navItems = [
  {
    href: "/",
    label: "Inicio",
    icon: Home,
  },
  {
    href: "/overview",
    label: "Resumen",
    icon: LayoutDashboard,
  },
  {
    href: "/flow",
    label: "Diagrama",
    icon: Workflow,
  },
  {
    href: "/artefactos",
    label: "Artefactos",
    icon: Archive,
  },
  {
    href: "/contexts",
    label: "Contextos",
    icon: Layers,
  },
  {
    href: "/settings",
    label: "Configuración",
    icon: Settings,
  },
];

interface MainNavProps {
  collapsed?: boolean;
}

export function MainNav({ collapsed = false }: MainNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-1 flex-col">
      <nav
        className={cn(
          "mt-8 flex flex-1 flex-col gap-1",
          collapsed ? "px-2" : "px-4"
        )}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <UserWallet collapsed={collapsed} />
    </div>
  );
}
