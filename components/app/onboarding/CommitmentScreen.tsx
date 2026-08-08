"use client";

import { useState } from "react";
import { TapButton } from "@/components/app/onboarding/TapButton";

function feedbackFor(days: number) {
  if (days <= 2) return "Empezar suave también cuenta";
  if (days <= 5) return "Meta realista para empezar";
  return "Ambiciosa — te acompañamos";
}

export function CommitmentScreen({
  question,
  initialDays,
  onAnswer,
}: {
  question: string;
  initialDays?: number;
  onAnswer: (days: number) => void;
}) {
  const [days, setDays] = useState(initialDays ?? 5);

  return (
    <div className="flex flex-1 flex-col justify-center px-4 pb-16">
      <h1 className="font-display text-[27px] font-medium leading-[1.15] text-txt-primary">
        {question}
      </h1>

      <div className="mt-10 text-center">
        <span className="font-display text-[48px] font-medium tabular-nums text-txt-primary">
          {days}
        </span>
        <p className="text-[13px] text-txt-tertiary">días/semana</p>
      </div>

      <input
        type="range"
        min={1}
        max={7}
        step={1}
        value={days}
        onChange={(e) => setDays(Number(e.target.value))}
        className="mt-6 w-full accent-[var(--brand-primary)]"
        aria-label="Días por semana"
      />
      <div className="mt-1 flex justify-between text-[11px] text-txt-tertiary">
        <span>1</span>
        <span>7</span>
      </div>

      <p className="mt-4 text-center text-[14px] font-medium text-brand-primary">
        {feedbackFor(days)}
      </p>

      <div className="mt-8">
        <TapButton onClick={() => onAnswer(days)}>Fijar mi meta</TapButton>
      </div>
    </div>
  );
}
