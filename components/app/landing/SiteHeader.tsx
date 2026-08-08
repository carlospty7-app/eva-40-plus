import Link from "next/link";
import { Logo } from "@/components/app/ui/Logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border-default/60 bg-surface-base/97 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[720px] items-center justify-between px-6">
        <Link href="/" aria-label="EVA 40+">
          <Logo height={40} />
        </Link>
        <Link
          href="/login"
          className="text-sm font-medium text-txt-secondary transition-colors hover:text-brand-primary"
        >
          Entrar
        </Link>
      </div>
    </header>
  );
}
