"use client";

import { useId } from "react";

/**
 * Textura botánica abstracta (hojas/pétalos difuminados) — aproximación honesta del
 * motivo botánico/mariposa de la referencia (FICHA-ARTE.md) mientras no hay fotografía
 * de marca licenciada (pendiente en 20-ASSETS-VISUALES, ver ESTADO.md).
 * Pocas formas, grandes, con una vena central NÍTIDA (sin blur) para que se lean
 * como hojas reconocibles y no como manchas de gradiente genéricas.
 * Solo tonos verdes de marca (Sage/Forest) — el dorado queda reservado a su único
 * acento puntual (badge "Más popular") para no exceder el máximo de colores de marca.
 */
export function BotanicalGlow({
  className = "",
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  const filterId = `botanical-blur-${useId()}`;
  const leaf = "M0,-70 C38,-50 38,50 0,70 C-38,50 -38,-50 0,-70 Z";
  const vein = "M0,-62 L0,62 M0,-20 L-18,4 M0,-20 L18,4 M0,26 L-16,46 M0,26 L16,46";
  const fillOpacity = variant === "dark" ? 0.85 : 0.55;
  const veinOpacity = variant === "dark" ? 0.35 : 0.4;
  const blurStd = variant === "dark" ? 2 : 1;

  const leaves = [
    { fill: "var(--brand-secondary)", transform: "translate(50,70) rotate(-22) scale(1.3)" },
    { fill: "var(--brand-primary)", transform: "translate(345,110) rotate(48) scale(0.9)" },
    { fill: "var(--brand-secondary)", transform: "translate(300,430) rotate(18) scale(1.15)" },
  ];

  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={blurStd} />
        </filter>
      </defs>
      {leaves.map((l, i) => (
        <g key={i} transform={l.transform}>
          <path d={leaf} fill={l.fill} opacity={fillOpacity} filter={`url(#${filterId})`} />
          <path
            d={vein}
            stroke={l.fill}
            strokeWidth={2.5}
            strokeLinecap="round"
            fill="none"
            opacity={veinOpacity}
          />
        </g>
      ))}
    </svg>
  );
}
