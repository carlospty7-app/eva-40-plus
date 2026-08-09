import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  CalendarCheck,
  CircleCheck,
  Gauge,
  HeartPulse,
  LineChart,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { obtenerDatosPanelAdmin } from "@/lib/supabase/admin-queries";
import { formatoCorto } from "@/lib/app/dates";
import { DatoHeroe, NoMedido } from "@/components/app/admin/DatoHeroe";
import { TablaUsuarios } from "@/components/app/admin/TablaUsuarios";
import { GraficoCheckins } from "@/components/app/admin/GraficoCheckins";

export const dynamic = "force-dynamic";

function TituloSeccion({
  icon: Icon,
  color,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <h2 className="flex items-center gap-2.5 text-[15px] font-semibold text-txt-primary">
      <span className={`flex h-7 w-7 items-center justify-center rounded-full ${color}`}>
        <Icon className="h-4 w-4" />
      </span>
      {children}
    </h2>
  );
}

export default async function AdminPage() {
  const datos = await obtenerDatosPanelAdmin();

  const activacionPct =
    datos.totalUsuarios > 0 ? Math.round((datos.usuariasConAlgunCheckin / datos.totalUsuarios) * 100) : null;

  // Aviso principal — solo uno a la vez, priorizado por impacto (mismo criterio que 21-BACKOFFICE.md).
  const aviso =
    datos.erroresUltimas24h >= 5
      ? {
          tono: "atencion" as const,
          texto: `${datos.erroresUltimas24h} errores en las últimas 24 horas — revisa la sección de Salud abajo.`,
        }
      : datos.totalUsuarios === 0
        ? {
            tono: "info" as const,
            texto: "Aún no hay usuarias registradas — este panel se va a llenar solo con el uso real de la app.",
          }
        : { tono: "bien" as const, texto: "Todo en orden este mes." };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-brand-primary-soft/40 via-surface-base to-surface-base px-4 pb-16 pt-6 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-[22px] font-semibold text-txt-primary">Panel de administración</h1>
            <p className="mt-0.5 text-[13px] text-txt-secondary">Solo tú puedes ver esta página.</p>
          </div>
          <Link
            href="/app"
            className="flex h-9 items-center rounded-full border border-border-default bg-surface-primary px-4 text-[13px] font-medium text-txt-secondary"
          >
            Volver a la app
          </Link>
        </div>

        <div
          className={`mt-5 flex items-center gap-2.5 rounded-xl p-3.5 text-[13px] font-medium ${
            aviso.tono === "atencion"
              ? "bg-status-warning-soft text-status-warning"
              : aviso.tono === "bien"
                ? "bg-status-success-soft text-status-success"
                : "bg-brand-primary-soft text-brand-primary"
          }`}
        >
          {aviso.tono === "atencion" ? (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          ) : (
            <CircleCheck className="h-4 w-4 shrink-0" />
          )}
          {aviso.texto}
        </div>

        {/* 1. Ventas y suscripciones */}
        <section className="mt-7">
          <TituloSeccion icon={LineChart} color="bg-brand-primary-soft text-brand-primary">
            Ventas y suscripciones
          </TituloSeccion>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <DatoHeroe label="Usuarias totales" valor={datos.totalUsuarios} color="teal" icon={Users} />
            <DatoHeroe label="Nuevas esta semana" valor={datos.nuevasEstaSemana} color="coral" icon={UserPlus} />
            <DatoHeroe label="En prueba gratuita" valor={datos.enTrial} color="gold" icon={Sparkles} />
            <DatoHeroe label="Prueba vencida" valor={datos.trialVencido} color="neutral" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <DatoHeroe label="Plan anual" valor={datos.planAnual} color="sage" />
            <DatoHeroe label="Plan mensual" valor={datos.planMensual} color="sage" />
          </div>
          <div className="mt-3">
            <NoMedido>
              💸 Ingresos, ganancia real y cancelaciones: <b>no medido todavía</b> — se activa solo
              cuando conectes el cobro por Hotmart (ver guía de venta).
            </NoMedido>
          </div>
        </section>

        {/* 2. Usuarios */}
        <section className="mt-8">
          <TituloSeccion icon={Users} color="bg-brand-secondary/15 text-brand-secondary">
            Usuarias
          </TituloSeccion>
          <div className="mt-3">
            <TablaUsuarios usuarios={datos.usuarios} />
          </div>
        </section>

        {/* 3. Salud y errores */}
        <section className="mt-8">
          <TituloSeccion icon={HeartPulse} color="bg-status-error-soft text-status-error">
            Salud
          </TituloSeccion>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <DatoHeroe
              label="Errores (24h)"
              valor={datos.erroresUltimas24h}
              tono={datos.erroresUltimas24h >= 5 ? "atencion" : "bien"}
              color={datos.erroresUltimas24h >= 5 ? "coral" : "sage"}
            />
          </div>

          {datos.erroresRecientes.length === 0 ? (
            <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-status-success-soft p-3.5 text-[13px] font-medium text-status-success">
              <CircleCheck className="h-4 w-4 shrink-0" /> Sin errores registrados por ahora.
            </div>
          ) : (
            <div className="mt-3 overflow-hidden rounded-xl border border-border-default/60">
              {datos.erroresRecientes.map((e) => (
                <div key={e.id} className="border-b border-border-default/40 p-3.5 text-[13px] last:border-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-status-error-soft px-2 py-0.5 text-[11px] font-medium text-status-error">
                      {e.context}
                    </span>
                    <span className="text-[11.5px] text-txt-tertiary">
                      {formatoCorto(new Date(e.createdAt))}
                    </span>
                  </div>
                  <p className="mt-1.5 text-txt-secondary">{e.message}</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3">
            <NoMedido>🔌 Estado de webhooks de pago: no medido — no hay integración de Hotmart aún.</NoMedido>
          </div>
        </section>

        {/* 4. Uso y métricas */}
        <section className="mt-8">
          <TituloSeccion icon={Gauge} color="bg-brand-gold/20 text-[#8a6d1f]">
            Uso
          </TituloSeccion>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <DatoHeroe
              label="Activación"
              valor={activacionPct === null ? "—" : `${activacionPct}%`}
              insight="Usuarias con al menos un check-in registrado"
              color="teal"
              icon={Sparkles}
            />
            <DatoHeroe label="Activas hoy" valor={datos.activasHoy} color="coral" />
            <DatoHeroe label="Activas esta semana" valor={datos.activasSemana} color="coral" />
            <DatoHeroe label="Activas este mes" valor={datos.activasMes} color="coral" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <DatoHeroe label="Check-ins totales" valor={datos.totalCheckins} color="gold" icon={CalendarCheck} />
            <DatoHeroe label="Check-ins (7 días)" valor={datos.checkinsUltimos7Dias} color="gold" icon={Calendar} />
          </div>
          <div className="mt-3">
            <GraficoCheckins porDia={datos.checkinsPorDia} porMes={datos.checkinsPorMes} />
          </div>
          <div className="mt-3">
            <NoMedido>
              📉 Retención D1/D7/D30 exacta y punto de abandono por pantalla: no medido — falta más
              historial de uso real para calcularlos con sentido.
            </NoMedido>
          </div>
        </section>
      </div>
    </div>
  );
}
