"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/** Video bajo demanda: muestra un póster con botón de play y solo descarga el archivo cuando la
 * usuaria lo toca (evita un bloque gris vacío y ahorra datos en celulares LATAM). */
export function VideoConPoster({ src, titulo, duracion }: { src: string; titulo: string; duracion?: string }) {
  const [activo, setActivo] = useState(false);

  if (activo) {
    return (
      <video
        key={src}
        controls
        autoPlay
        playsInline
        className="mt-2.5 aspect-video w-full rounded-xl bg-txt-primary object-cover"
      >
        <source src={src} type="video/mp4" />
      </video>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActivo(true)}
      aria-label={`Reproducir video: ${titulo}`}
      className="relative mt-2.5 flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-primary to-brand-primary/80"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-primary/95 text-brand-primary shadow-md">
        <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
      </span>
      <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/40 to-transparent px-3 pb-2 pt-6 text-[13px] font-medium text-white">
        <span className="truncate">{titulo}</span>
        {duracion && <span className="ml-2 shrink-0">{duracion}</span>}
      </span>
    </button>
  );
}
