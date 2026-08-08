import Link from "next/link";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-surface-base px-6 py-16">
      <div className="mx-auto w-full max-w-[640px]">
        <Link href="/" className="text-[13px] font-medium text-brand-primary">
          ← Volver a EVA 40+
        </Link>
        <h1 className="mt-4 font-display text-[28px] font-medium text-txt-primary">{title}</h1>
        <p className="mt-1 text-[12.5px] text-txt-tertiary">Última actualización: {updated}</p>
        <div className="prose-legal mt-8 space-y-4 text-[14px] leading-relaxed text-txt-secondary">
          {children}
        </div>
      </div>
    </main>
  );
}
