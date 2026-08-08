import Link from "next/link";
import { Logo } from "@/components/app/ui/Logo";

const links = [
  { href: "/legal/privacidad", label: "Política de Privacidad" },
  { href: "/legal/terminos", label: "Términos y Condiciones" },
  { href: "/legal/reembolso", label: "Política de Reembolso" },
  { href: "/legal/disclaimer-ia", label: "Aviso de Bienestar" },
];

export function FooterLegal() {
  return (
    <footer className="border-t border-border-default bg-surface-base px-6 py-10">
      <div className="mx-auto w-full max-w-[720px] text-center">
        <div className="flex justify-center">
          <Logo height={44} />
        </div>
        <nav className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[12.5px] text-txt-tertiary">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-brand-primary">
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="mt-4 text-[12px] text-txt-tertiary">
          Soporte: <a href="mailto:hola@eva40.app" className="hover:text-brand-primary">hola@eva40.app</a>
        </p>
        <p className="mt-2 text-[11.5px] text-txt-tertiary">
          © {new Date().getFullYear()} MaruHealthy. EVA 40+ ofrece orientación de bienestar y no
          reemplaza consejo médico profesional.
        </p>
      </div>
    </footer>
  );
}
