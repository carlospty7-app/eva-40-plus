import { LegalPage } from "@/components/app/landing/LegalPage";

export default function PrivacidadPage() {
  return (
    <LegalPage title="Política de Privacidad" updated="24 de julio de 2026">
      <p>
        En EVA 40+ (operada por MaruHealthy) nos tomamos en serio tus datos, especialmente porque
        nos cuentas cosas personales sobre tu salud y bienestar.
      </p>
      <p>
        <strong>Qué datos recopilamos:</strong> tu nombre, correo, respuestas del diagnóstico
        (síntomas, hábitos, objetivos), tus check-ins diarios y datos de pago procesados por
        nuestra plataforma de venta (Hotmart) — nosotros no almacenamos tu número de tarjeta.
      </p>
      <p>
        <strong>Para qué los usamos:</strong> generar tu Score Metabólico y tu ruta semanal
        personalizada, mejorar el servicio, y enviarte comunicaciones relacionadas con tu cuenta.
        No vendemos tus datos a terceros.
      </p>
      <p>
        <strong>Dónde se guardan:</strong> en infraestructura con controles de acceso (Supabase),
        protegida con reglas que impiden que otra persona vea tus datos.
      </p>
      <p>
        <strong>Tus derechos:</strong> puedes pedir una copia de tus datos o su eliminación
        completa escribiendo a hola@eva40.app. Respondemos en un máximo de 10 días hábiles.
      </p>
      <p>
        <strong>IA:</strong> algunas partes de tu diagnóstico y ruta se generan con modelos de
        inteligencia artificial. Ver nuestro Aviso de Bienestar para más detalle.
      </p>
    </LegalPage>
  );
}
