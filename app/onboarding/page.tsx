"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Sunrise, UtensilsCrossed, Moon as MoonIcon, Sparkles, HeartHandshake } from "lucide-react";
import Link from "next/link";
import { BotanicalGlow } from "@/components/app/ui/BotanicalGlow";
import { Logo } from "@/components/app/ui/Logo";
import { OnboardingHeader } from "@/components/app/onboarding/OnboardingHeader";
import { WelcomeScreen } from "@/components/app/onboarding/WelcomeScreen";
import { QuestionScreen } from "@/components/app/onboarding/QuestionScreen";
import { RecognitionScreen } from "@/components/app/onboarding/RecognitionScreen";
import { CommitmentScreen } from "@/components/app/onboarding/CommitmentScreen";
import { LoadingPlanScreen } from "@/components/app/onboarding/LoadingPlanScreen";
import { ResultScreen } from "@/components/app/onboarding/ResultScreen";
import {
  computeScore,
  computePriorities,
  scoreLabel,
  dolorPrincipalLabel,
  sintomasSecundariosLabel,
  type Answers,
} from "@/lib/onboarding/engine";
import { guardarDiagnostico } from "@/lib/onboarding/storage";

type Step =
  | { type: "question"; key: keyof Answers; render: (a: Answers) => React.ReactNode }
  | { type: "recognition"; render: (a: Answers) => React.ReactNode }
  | { type: "commitment" };

const EDAD_INSIGHTS: Record<string, string> = {
  "40-45": "Estás en el momento exacto donde la caída de estrógenos empieza a cambiar las reglas de tu metabolismo.",
  "46-50": "En este rango la sensibilidad al cortisol sube — por eso el estrés se siente directo en tu abdomen.",
  "51-55": "Tu cuerpo ya reguló bastante sus reglas nuevas — es el mejor momento para darle una ruta clara.",
  otra: "No pasa nada — tu ruta se ajusta igual a lo que tu cuerpo te está mostrando ahora.",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<"welcome" | "quiz" | "loading" | "result">("welcome");
  const [direction, setDirection] = useState(1);

  const steps: Step[] = useMemo(
    () => [
      {
        type: "question",
        key: "edad",
        render: (a) => (
          <QuestionScreen
            eyebrow="Para empezar"
            question="¿Cuál es tu rango de edad?"
            options={[
              { value: "40-45", label: "40 a 45 años" },
              { value: "46-50", label: "46 a 50 años" },
              { value: "51-55", label: "51 a 55 años" },
              { value: "otra", label: "Otra edad" },
            ]}
            insights={EDAD_INSIGHTS}
            initialValue={a.edad}
            onAnswer={(v) => answerAndNext("edad", v)}
          />
        ),
      },
      {
        type: "question",
        key: "momento",
        render: (a) => (
          <QuestionScreen
            question="¿Cuándo sientes más el problema?"
            microcopy="Esto ayuda a enfocar tu ruta en el momento correcto del día"
            options={[
              { value: "despertar", label: "Al despertar", icon: Sunrise },
              { value: "comer", label: "Después de comer", icon: UtensilsCrossed },
              { value: "tarde", label: "En la tarde" },
              { value: "dormir", label: "Antes de dormir", icon: MoonIcon },
            ]}
            initialValue={a.momento}
            onAnswer={(v) => answerAndNext("momento", v)}
          />
        ),
      },
      {
        type: "question",
        key: "dolorPrincipal",
        render: (a) => (
          <QuestionScreen
            eyebrow="Tu dolor principal"
            question="¿Cómo se siente tu abdomen habitualmente?"
            options={[
              {
                value: "hinchazon_progresiva",
                label: "Me levanto plana, pero me inflamo a lo largo del día",
              },
              {
                value: "pesadez_constante",
                label: "Siento pesadez y distensión constante, incluso tomando agua",
              },
              {
                value: "ropa_apretada",
                label: "Siento que acumulé grasa en la cintura y mi ropa ya no me cierra igual",
              },
            ]}
            initialValue={a.dolorPrincipal}
            onAnswer={(v) => answerAndNext("dolorPrincipal", v)}
          />
        ),
      },
      {
        type: "recognition",
        render: (a) => (
          <RecognitionScreen
            icon={HeartHandshake}
            title="No eres tú fallando"
            body={`Lo que describes — ${dolorPrincipalLabel(a.dolorPrincipal)} — le pasa a muchas mujeres después de los 40: no es falta de disciplina, es que la caída de estrógenos cambia cómo tu cuerpo maneja la inflamación y el cortisol. Tu ruta se arma para esas reglas nuevas, no para las de antes.`}
            onContinue={next}
          />
        ),
      },
      {
        type: "question",
        key: "sintomasSecundarios",
        render: (a) => (
          <QuestionScreen
            question="¿Qué otros síntomas notas con frecuencia?"
            multiple
            options={[
              { value: "antojos_tarde", label: "Bajón de energía y antojos de dulce en la tarde" },
              { value: "insomnio_madrugada", label: "Despertares de madrugada o sueño ligero" },
              { value: "niebla_mental", label: "Niebla mental o falta de concentración" },
              { value: "rigidez_articular", label: "Rigidez articular al despertar" },
            ]}
            initialValues={a.sintomasSecundarios}
            onAnswerMultiple={(values) => {
              setAnswers((prev) => ({ ...prev, sintomasSecundarios: values }));
              next();
            }}
          />
        ),
      },
      {
        type: "question",
        key: "yaIntento",
        render: (a) => (
          <QuestionScreen
            question="¿Qué has intentado en los últimos 12 meses?"
            options={[
              { value: "Dietas o contadores de calorías", label: "Dietas o contadores de calorías" },
              { value: "Gimnasio o cardio intenso", label: "Gimnasio o cardio intenso" },
              { value: "Ayuno prolongado o detox", label: "Ayuno prolongado o detox" },
              { value: "Suplementos quemagrasa", label: "Suplementos quemagrasa" },
              { value: "otra", label: "Otra cosa (escribe la tuya)" },
            ]}
            freeTextPlaceholder="Ej. retos de Instagram, té detox..."
            initialValue={a.yaIntento}
            onAnswer={(v) => answerAndNext("yaIntento", v)}
          />
        ),
      },
      {
        type: "recognition",
        render: (a) => (
          <RecognitionScreen
            icon={Sparkles}
            title="El problema no fue tu fuerza de voluntad"
            body={`El ejercicio muy intenso y recortar calorías elevan tu cortisol después de los 40, y eso activa el modo de reserva de grasa justo en el abdomen — por eso ${sintomasSecundariosLabel(a.sintomasSecundarios)} no se resuelve solo con más disciplina. No fallaste tú — falló la estrategia. Con esto ya tenemos lo suficiente para armar tu ruta.`}
            onContinue={next}
          />
        ),
      },
      {
        type: "commitment",
      },
      {
        type: "question",
        key: "prioridad",
        render: (a) => (
          <QuestionScreen
            question="¿Cuál es tu prioridad #1 ahora?"
            options={[
              { value: "desinflamar", label: "Desinflamarme" },
              { value: "grasa", label: "Bajar grasa abdominal" },
              { value: "dormir", label: "Dormir mejor" },
              { value: "energia", label: "Tener más energía" },
            ]}
            initialValue={a.prioridad}
            onAnswer={(v) => answerAndNext("prioridad", v)}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answers]
  );

  function answerAndNext(key: keyof Answers, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    next();
  }

  function next() {
    setDirection(1);
    if (stepIndex >= steps.length - 1) {
      setPhase("loading");
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function back() {
    if (phase !== "quiz") return;
    setDirection(-1);
    if (stepIndex === 0) {
      setPhase("welcome");
      return;
    }
    setStepIndex((i) => i - 1);
  }

  const questionSteps = steps.filter((s) => s.type !== "recognition").length;
  const answeredSoFar = steps.slice(0, stepIndex).filter((s) => s.type !== "recognition").length;
  const progress = phase === "quiz" ? (answeredSoFar / questionSteps) * 100 : 100;

  const currentStep = steps[stepIndex];
  const score = computeScore(answers);
  const priorities = computePriorities(answers);
  const loadingLines = [
    `Analizando tu perfil hormonal y digestivo`,
    `Revisando tu dolor principal: ${dolorPrincipalLabel(answers.dolorPrincipal)}`,
    `Calculando tu Score Metabólico 40+`,
    `Armando tu ruta antiinflamatoria sin conteo de calorías`,
  ];

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-surface-base">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[640px] overflow-hidden">
        <BotanicalGlow variant="light" />
      </div>
      {phase !== "welcome" && (
        <div className="relative flex items-center justify-center pt-4">
          <Link href="/" aria-label="EVA 40+">
            <Logo height={42} />
          </Link>
        </div>
      )}

      {phase === "quiz" && <OnboardingHeader progress={progress} onBack={back} showBack />}

      <AnimatePresence mode="wait" initial={false}>
        {phase === "welcome" && (
          <motion.div key="welcome" className="flex flex-1 flex-col" exit={{ opacity: 0 }}>
            <WelcomeScreen onStart={() => setPhase("quiz")} />
          </motion.div>
        )}

        {phase === "quiz" && (
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -24 : 24 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-1 flex-col"
          >
            {currentStep.type === "commitment" ? (
              <CommitmentScreen
                question="¿Cuántos días a la semana puedes dedicar 5 minutos a tu check-in?"
                initialDays={answers.diasCompromiso}
                onAnswer={(days) => {
                  setAnswers((prev) => ({ ...prev, diasCompromiso: days }));
                  next();
                }}
              />
            ) : (
              currentStep.render(answers)
            )}
          </motion.div>
        )}

        {phase === "loading" && (
          <motion.div key="loading" className="flex flex-1 flex-col" exit={{ opacity: 0 }}>
            <LoadingPlanScreen lines={loadingLines} onDone={() => setPhase("result")} />
          </motion.div>
        )}

        {phase === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-1 flex-col"
          >
            <ResultScreen
              score={score}
              scoreLabel={scoreLabel(score)}
              priorities={priorities}
              dolorLabel={dolorPrincipalLabel(answers.dolorPrincipal)}
              onContinue={() => {
                guardarDiagnostico({
                  score,
                  scoreLabel: scoreLabel(score),
                  priorities,
                  metaLabel: prioridadLabel(answers.prioridad),
                  dolorLabel: dolorPrincipalLabel(answers.dolorPrincipal),
                });
                router.push("/paywall");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function prioridadLabel(p?: Answers["prioridad"]) {
  switch (p) {
    case "desinflamar":
      return "desinflamarte";
    case "grasa":
      return "bajar grasa abdominal";
    case "dormir":
      return "dormir mejor";
    case "energia":
      return "tener más energía";
    default:
      return "sentirte mejor";
  }
}
