"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Check, ChevronLeft, Copy, ShoppingBasket } from "lucide-react";
import { CargandoOError } from "@/components/app/ui/CargandoOError";
import { listaDeComprasSemana } from "@/lib/app/engine";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { cargarEstadoSupabase } from "@/lib/supabase/queries";
import type { EstadoApp } from "@/lib/app/types";

const CATEGORIAS: { titulo: string; palabras: string[] }[] = [
  { titulo: "Proteínas", palabras: ["huevo", "yogur", "pescado", "proteín", "legumbre", "pollo", "carne"] },
  { titulo: "Verduras y frutas", palabras: ["vegetal", "hoja verde", "calabaza", "fruta"] },
  { titulo: "Granos y semillas", palabras: ["quinoa", "avena", "chía", "arroz", "semilla"] },
  { titulo: "Grasas saludables", palabras: ["palta", "almendra", "nuez", "nueces"] },
];
const CATEGORIA_OTROS = "Para tu rutina";

function categoriaDe(item: string): string {
  const texto = item.toLowerCase();
  return CATEGORIAS.find((c) => c.palabras.some((p) => texto.includes(p)))?.titulo ?? CATEGORIA_OTROS;
}

function claveAlmacenamiento(semana: string): string {
  return `eva:compras:${semana}`;
}

export default function ListaDeComprasPage() {
  const router = useRouter();
  const [estado, setEstado] = useState<EstadoApp | null>(null);
  const [marcados, setMarcados] = useState<Set<string>>(new Set());
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const supabase = crearClienteNavegador();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const cargado = await cargarEstadoSupabase(supabase, data.user.id);
      if (cargado) setEstado(cargado);
    });
  }, []);

  const semana = estado?.rutaSemana[0]?.fecha;

  // Lo marcado se recuerda en el teléfono (por semana), para no perderlo al salir del súper.
  useEffect(() => {
    if (!semana) return;
    try {
      const guardado = localStorage.getItem(claveAlmacenamiento(semana));
      if (guardado) setMarcados(new Set(JSON.parse(guardado) as string[]));
    } catch {
      // sin almacenamiento disponible: la lista funciona igual, solo no se recuerda
    }
  }, [semana]);

  const lista = useMemo(() => (estado ? listaDeComprasSemana(estado.rutaSemana) : []), [estado]);
  const grupos = useMemo(() => {
    const mapa = new Map<string, string[]>();
    lista.forEach((item) => {
      const cat = categoriaDe(item);
      mapa.set(cat, [...(mapa.get(cat) ?? []), item]);
    });
    const orden = [...CATEGORIAS.map((c) => c.titulo), CATEGORIA_OTROS];
    return orden.filter((t) => mapa.has(t)).map((t) => ({ titulo: t, items: mapa.get(t)! }));
  }, [lista]);

  function toggle(item: string) {
    setMarcados((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      if (semana) {
        try {
          localStorage.setItem(claveAlmacenamiento(semana), JSON.stringify([...next]));
        } catch {
          // ver nota arriba
        }
      }
      return next;
    });
  }

  async function copiarLista() {
    try {
      await navigator.clipboard.writeText(lista.map((i) => `${marcados.has(i) ? "✔" : "•"} ${i}`).join("\n"));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // el navegador bloqueó el portapapeles: no hay nada más que hacer
    }
  }

  const encabezado = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Atrás"
        className="flex h-11 w-11 items-center justify-center rounded-full text-txt-secondary"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <span className="font-display text-[17px] text-txt-primary">Alimentos de tu semana</span>
    </div>
  );

  if (!estado) {
    return (
      <div className="relative min-h-dvh px-4 pt-4">
        {encabezado}
        <CargandoOError>
          <div className="mt-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-surface-tertiary/50" />
            ))}
          </div>
        </CargandoOError>
      </div>
    );
  }

  if (lista.length === 0) {
    return (
      <div className="relative min-h-dvh px-4 pt-4">
        {encabezado}
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <ShoppingBasket className="h-8 w-8 text-brand-primary" aria-hidden />
          <h1 className="font-display text-[18px] font-medium text-txt-primary">Aún no hay alimentos para tu semana</h1>
          <p className="max-w-[280px] text-[14px] text-txt-secondary">
            Aparece sola cuando tu ruta de la semana tiene alimentos recomendados. Haz tu revisión de hoy y
            vuelve.
          </p>
          <Link
            href="/app"
            className="mt-1 flex h-11 items-center justify-center rounded-full bg-brand-primary px-6 text-[14px] font-semibold text-txt-inverse"
          >
            Hacer mi revisión
          </Link>
        </div>
      </div>
    );
  }

  const total = lista.length;
  const hechos = lista.filter((i) => marcados.has(i)).length;

  return (
    <div className="relative min-h-dvh px-4 pb-28 pt-4">
      {encabezado}

      <p className="mt-3 text-[14px] text-txt-secondary">
        Lo que te recomendamos tener a la mano esta semana. Marca lo que ya tienes o lo que vas comprando.
      </p>

      <div className="mt-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-tertiary">
          <div
            className="h-full rounded-full bg-brand-primary transition-all"
            style={{ width: `${Math.round((hechos / total) * 100)}%` }}
          />
        </div>
        <span className="text-[13px] font-medium text-txt-primary">
          {hechos} de {total}
        </span>
        <button
          type="button"
          onClick={copiarLista}
          className="flex h-11 items-center gap-1.5 rounded-full border border-border-strong px-4 text-[13px] font-medium text-txt-secondary"
        >
          <Copy className="h-3.5 w-3.5" /> {copiado ? "Copiada" : "Copiar"}
        </button>
      </div>

      {grupos.map((grupo) => (
        <section key={grupo.titulo} className="mt-5">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-txt-tertiary">
            {grupo.titulo}
          </h2>
          <div className="mt-2 rounded-xl border border-border-default/60 bg-surface-primary shadow-sm">
            {grupo.items.map((item, i) => {
              const marcado = marcados.has(item);
              return (
                <motion.button
                  key={item}
                  type="button"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => toggle(item)}
                  aria-pressed={marcado}
                  className="flex min-h-[52px] w-full items-center gap-3 border-b border-border-default/60 px-4 py-3 text-left last:border-0"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      marcado ? "border-brand-primary bg-brand-primary" : "border-border-strong"
                    }`}
                  >
                    {marcado && <Check className="h-3.5 w-3.5 text-txt-inverse" strokeWidth={3} />}
                  </span>
                  <span className={`text-[14.5px] ${marcado ? "text-txt-tertiary line-through" : "text-txt-primary"}`}>
                    {item}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
