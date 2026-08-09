"use client";

import { useState, type ReactNode } from "react";

export type TabAdmin = { id: string; label: string; content: ReactNode };

export function TabsShell({ tabs }: { tabs: TabAdmin[] }) {
  const [activo, setActivo] = useState(tabs[0]?.id);
  const actual = tabs.find((t) => t.id === activo) ?? tabs[0];

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 mb-6 flex gap-1 overflow-x-auto border-b border-border-default/60 bg-surface-base/95 px-4 pt-1 pb-2 backdrop-blur sm:-mx-8 sm:px-8">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActivo(t.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-[13.5px] font-medium transition-colors ${
              activo === t.id
                ? "bg-brand-accent text-txt-inverse shadow-sm"
                : "text-txt-secondary hover:bg-surface-secondary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {actual?.content}
    </div>
  );
}
