"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { Logo } from "@/components/app/ui/Logo";

export function TopHeader({ titulo, logo = false }: { titulo: string; logo?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 pt-4">
      {logo ? <Logo height={34} /> : <span className="font-display text-[15px] text-txt-primary">{titulo}</span>}
      <Link
        href="/app/cuenta"
        aria-label="Cuenta y configuración"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-tertiary/60 text-txt-secondary"
      >
        <UserRound className="h-[18px] w-[18px]" />
      </Link>
    </div>
  );
}
