"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";

/** Video bajo demanda: muestra el primer cuadro real del video (solo se descargan los metadatos) con
 * un botón de play encima, y lo reproduce al tocarlo. Así no es un bloque gris vacío y se ahorran
 * datos en celulares LATAM. */
export function VideoConPoster({ src, titulo, duracion }: { src: string; titulo: string; duracion?: string }) {
  const [activo, setActivo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  function reproducir() {
    setActivo(true);
    const video = videoRef.current;
    if (!video) return;
    video.preload = "auto";
    video.play().catch(() => {
      // si el navegador bloquea el autoplay, la usuaria ya tiene los controles para darle play
    });
  }

  return (
    <div className="relative mt-2.5 aspect-video w-full overflow-hidden rounded-xl bg-brand-primary">
      <video
        ref={videoRef}
        src={`${src}#t=0.5`}
        preload="metadata"
        playsInline
        muted={false}
        controls={activo}
        aria-label={titulo}
        className="h-full w-full object-cover"
      />
      {!activo && (
        <button
          type="button"
          onClick={reproducir}
          aria-label={`Reproducir video: ${titulo}`}
          className="absolute inset-0 flex items-center justify-center bg-black/20"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-primary/95 text-brand-primary shadow-md">
            <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
          </span>
          <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/50 to-transparent px-3 pb-2 pt-6 text-[13px] font-medium text-white">
            <span className="truncate">{titulo}</span>
            {duracion && <span className="ml-2 shrink-0">{duracion}</span>}
          </span>
        </button>
      )}
    </div>
  );
}
