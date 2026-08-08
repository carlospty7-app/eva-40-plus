"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

export function LoadingPlanScreen({
  lines,
  onDone,
}: {
  lines: string[];
  onDone: () => void;
}) {
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    if (completed >= lines.length) {
      const t = setTimeout(onDone, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCompleted((c) => c + 1), 750);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed, lines.length]);

  const pct = Math.round((completed / lines.length) * 100);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6" aria-live="polite" aria-busy={completed < lines.length}>
      <div
        className="flex h-28 w-28 items-center justify-center rounded-full transition-[background] duration-500"
        style={{
          background: `conic-gradient(var(--brand-primary) ${pct * 3.6}deg, var(--surface-tertiary) ${pct * 3.6}deg 360deg)`,
        }}
      >
        <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-surface-base">
          <span className="font-display text-[24px] font-medium tabular-nums text-txt-primary">
            {pct}%
          </span>
        </div>
      </div>

      <h1 className="mt-6 font-display text-[22px] font-medium text-txt-primary">
        Construyendo tu ruta…
      </h1>

      <div className="mt-7 w-full max-w-[300px] space-y-3">
        {lines.map((line, i) => {
          const done = i < completed;
          const active = i === completed;
          return (
            <div key={line} className="flex items-center gap-3">
              {done ? (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary text-txt-inverse">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              ) : (
                <span
                  className={`h-5 w-5 shrink-0 rounded-full border-2 ${
                    active ? "animate-pulse border-brand-primary" : "border-border-strong"
                  }`}
                />
              )}
              <span
                className={`text-[14px] ${done || active ? "text-txt-primary" : "text-txt-tertiary/50"}`}
              >
                {line}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
