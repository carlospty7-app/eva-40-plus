"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { CalendarCheck, House, MessagesSquare, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TABS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/app", label: "Hoy", icon: House },
  { href: "/app/ruta", label: "Mi Ruta", icon: CalendarCheck },
  { href: "/app/progreso", label: "Progreso", icon: TrendingUp },
  { href: "/app/eva", label: "EVA", icon: MessagesSquare },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border-default bg-surface-base/95 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur"
    >
      <div className="mx-auto flex max-w-[420px] items-center justify-around px-2">
        {TABS.map((tab) => {
          const activo = tab.href === "/app" ? pathname === "/app" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex min-w-[64px] flex-col items-center gap-1 px-2 py-1.5"
            >
              {activo && (
                <motion.span
                  layoutId="bottom-nav-activo"
                  className="absolute inset-x-1 top-0 h-0.5 rounded-full bg-brand-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon
                className={`h-5 w-5 ${activo ? "text-brand-primary" : "text-txt-tertiary"}`}
                strokeWidth={activo ? 2.4 : 2}
              />
              <span
                className={`text-[10.5px] font-medium ${activo ? "text-brand-primary" : "text-txt-tertiary"}`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
