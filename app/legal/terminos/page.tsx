import { LegalPage } from "@/components/app/landing/LegalPage";

export default function TerminosPage() {
  return (
    <LegalPage title="Términos y Condiciones" updated="24 de julio de 2026">
      <p>
        Al usar EVA 40+ aceptas estos términos. Léelos con calma — están escritos en simple, sin
        letra chica.
      </p>
      <p>
        <strong>Qué es EVA 40+:</strong> una app de orientación de bienestar (nutrición
        funcional, hábitos, inflamación) pensada para mujeres de 40-55 años en cambios
        hormonales. No es un dispositivo médico ni un servicio de diagnóstico clínico.
      </p>
      <p>
        <strong>Suscripción:</strong> el acceso a EVA 40+ empieza con un cargo de $1 por los
        primeros 7 días; al terminar ese período se activa automáticamente el plan mensual o
        anual elegido, procesado de forma segura por Stripe, salvo que canceles antes. Puedes
        cancelar cuando quieras escribiéndonos a soporte; la cancelación aplica al final del
        período pagado.
      </p>
      <p>
        <strong>Uso permitido:</strong> la cuenta es personal e intransferible. No está permitido
        compartir el acceso ni usar el contenido con fines comerciales sin autorización.
      </p>
      <p>
        <strong>Cambios al servicio:</strong> podemos mejorar o ajustar funciones de la app;
        cambios que afecten materialmente tu plan se comunican por correo con anticipación.
      </p>
      <p>
        <strong>Contacto:</strong> hola@eva40.app.
      </p>
    </LegalPage>
  );
}
