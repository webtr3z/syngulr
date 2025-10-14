"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Settings, Workflow } from "lucide-react";

const navItems = [
  {
    href: "/",
    label: "Inicio",
    icon: Home,
  },
  {
    href: "/flow",
    label: "Diagrama",
    icon: Workflow,
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
    <nav className={cn("mt-8 flex flex-col gap-1", collapsed ? "px-2" : "px-4")}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              collapsed && "justify-center px-0",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
