"use client";

import { ChevronLeft } from "lucide-react";
import { GrowthBadge } from "@/components/app/onboarding/GrowthBadge";

export function OnboardingHeader({
  progress,
  onBack,
  showBack,
}: {
  progress: number;
  onBack: () => void;
  showBack: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 pt-4">
      <button
        type="button"
        onClick={onBack}
        aria-label="Atrás"
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-txt-secondary transition-opacity ${
          showBack ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-surface-tertiary">
        <div
          className="h-full rounded-full bg-brand-primary transition-[width] duration-300 ease-out"
          style={{ width: `${Math.max(6, progress)}%` }}
        />
      </div>
      <GrowthBadge progress={progress} />
    </div>
  );
}
