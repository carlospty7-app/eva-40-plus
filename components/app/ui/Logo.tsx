import Image from "next/image";

const ASPECT = 1707 / 608;

/** Isotipo + logotipo horizontal de la marca (public/brand/logo-horizontal.png).
 * `unoptimized`: el optimizador de imágenes de Next introduce un halo gris alrededor de los
 * bordes transparentes al reescalar este PNG (confirmado comparando la versión optimizada vs.
 * la cruda sobre un fondo rojo de prueba) — se sirve el archivo tal cual, ya es liviano. */
export function Logo({ height = 28, className = "" }: { height?: number; className?: string }) {
  return (
    <Image
      src="/brand/logo-horizontal.png"
      alt="EVA 40+"
      width={Math.round(height * ASPECT)}
      height={height}
      className={className}
      unoptimized
      priority
    />
  );
}
