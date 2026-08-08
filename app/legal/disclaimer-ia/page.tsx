import { LegalPage } from "@/components/app/landing/LegalPage";

export default function DisclaimerIaPage() {
  return (
    <LegalPage title="Aviso de Bienestar e Inteligencia Artificial" updated="24 de julio de 2026">
      <p>
        EVA 40+ usa tus respuestas de diagnóstico y check-ins, procesadas en parte con modelos de
        inteligencia artificial, para generar tu Score Metabólico 40+ y tu ruta semanal.
      </p>
      <p>
        <strong>Esto NO es un diagnóstico médico.</strong> EVA 40+ ofrece orientación de
        bienestar general (nutrición funcional, hábitos, movimiento ligero) y no reemplaza la
        consulta, el diagnóstico ni el tratamiento de un profesional de salud. Si tienes una
        condición médica diagnosticada, estás embarazada, en lactancia, o tomas medicación,
        revisa tu ruta con tu médico antes de aplicar cambios importantes.
      </p>
      <p>
        <strong>Precisión de la IA:</strong> las recomendaciones se basan en patrones generales y
        en lo que reportas — no en análisis de laboratorio ni estudios clínicos individuales.
        Pueden no ajustarse perfectamente a casos atípicos.
      </p>
      <p>
        <strong>Emergencias:</strong> si tienes síntomas severos o una emergencia de salud, EVA
        40+ no es el canal adecuado — contacta a un servicio médico de inmediato.
      </p>
    </LegalPage>
  );
}
