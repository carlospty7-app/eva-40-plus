import Link from "next/link";
import { AlertTriangle, Bot, Calendar, CalendarCheck, CircleCheck, Sparkles, UserPlus, Users } from "lucide-react";
import { obtenerDatosPanelAdmin } from "@/lib/supabase/admin-queries";
import { formatoCorto } from "@/lib/app/dates";
import { DatoHeroe, NoMedido } from "@/components/app/admin/DatoHeroe";
import { TablaUsuarios } from "@/components/app/admin/TablaUsuarios";
import { GraficoCheckins } from "@/components/app/admin/GraficoCheckins";
import { GraficoCostoIa } from "@/components/app/admin/GraficoCostoIa";
import { FormularioGasto } from "@/components/app/admin/FormularioGasto";
import { TabsShell, type TabAdmin } from "@/components/app/admin/TabsShell";

export const dynamic = "force-dynamic";

const formatoUsd = (n: number) => {
  const decimales = n > 0 && n < 0.01 ? 4 : 2;
  return `US$ ${n.toLocaleString("es", { minimumFractionDigits: decimales, maximumFractionDigits: decimales })}`;
};

export default async function AdminPage() {
  const datos = await obtenerDatosPanelAdmin();

  const activacionPct =
    datos.totalUsuarios > 0 ? Math.round((datos.usuariasConAlgunCheckin / datos.totalUsuarios) * 100) : null;

  // Aviso principal — solo uno a la vez, priorizado por impacto (mismo criterio que 21-BACKOFFICE.md).
  const aviso =
    datos.erroresUltimas24h >= 5
      ? {
          tono: "atencion" as const,
          texto: `${datos.erroresUltimas24h} errores en las últimas 24 horas — revisa la pestaña Salud.`,
        }
      : datos.totalUsuarios === 0
        ? {
            tono: "info" as const,
            texto: "Aún no hay usuarias registradas — este panel se va a llenar solo con el uso real de la app.",
          }
        : { tono: "bien" as const, texto: "Todo en orden este mes." };

  const tabResumen = (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <DatoHeroe label="Usuarias totales" valor={datos.totalUsuarios} color="teal" icon={Users} />
      <DatoHeroe
        label="Activación"
        valor={activacionPct === null ? "—" : `${activacionPct}%`}
        color="coral"
        icon={Sparkles}
      />
      <DatoHeroe
        label="Errores (24h)"
        valor={datos.erroresUltimas24h}
        tono={datos.erroresUltimas24h >= 5 ? "atencion" : "bien"}
        color={datos.erroresUltimas24h >= 5 ? "coral" : "sage"}
      />
      <DatoHeroe label="Costo de IA (mes)" valor={formatoUsd(datos.costoIaEsteMes)} color="gold" icon={Bot} />
    </div>
  );

  const tabVentas = (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
    </div>
  );

  const tabUsuarios = <TablaUsuarios usuarios={datos.usuarios} />;

  const tabSalud = (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                <span className="text-[11.5px] text-txt-tertiary">{formatoCorto(new Date(e.createdAt))}</span>
              </div>
              <p className="mt-1.5 text-txt-secondary">{e.message}</p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3">
        <NoMedido>🔌 Estado de webhooks de pago: no medido — no hay integración de Hotmart aún.</NoMedido>
      </div>
    </div>
  );

  const tabUso = (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
    </div>
  );

  const tabNegocio = (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <DatoHeroe label="MRR" valor="No medido" color="neutral" />
        <DatoHeroe label="LTV estimado" valor="No medido" color="neutral" />
        <DatoHeroe label="CAC" valor="No medido" color="neutral" />
        <DatoHeroe label="Ratio LTV : CAC" valor="No medido" color="neutral" />
        <DatoHeroe label="Payback" valor="No medido" color="neutral" />
      </div>
      <div className="mt-3">
        <NoMedido>
          📊 El MRR, LTV y CAC se calculan solos cuando conectes el cobro real por Hotmart — hoy
          nadie ha pagado todavía, así que no hay ingresos que medir ni dividir entre el gasto de
          abajo.
        </NoMedido>
      </div>

      <h3 className="mt-6 text-[13.5px] font-semibold text-txt-primary">Gasto en adquisición por canal</h3>
      {datos.gastoPorCanal.length === 0 ? (
        <div className="mt-2 rounded-xl border border-dashed border-border-strong bg-surface-secondary/40 p-3.5 text-[12.5px] text-txt-tertiary">
          Todavía no cargaste ningún gasto — el CAC y el LTV:CAC quedan sin medir hasta que
          registres alguno.
        </div>
      ) : (
        <div className="mt-2 overflow-hidden rounded-xl border border-border-default/60">
          {datos.gastoPorCanal.map((g) => (
            <div
              key={g.id}
              className="flex items-center justify-between border-b border-border-default/40 p-3 text-[13px] last:border-0"
            >
              <div>
                <p className="font-medium text-txt-primary">{g.channel}</p>
                <p className="text-[11.5px] text-txt-tertiary">
                  {formatoCorto(new Date(g.periodStart))} – {formatoCorto(new Date(g.periodEnd))}
                </p>
              </div>
              <p className="font-display text-[16px] font-semibold text-txt-primary">
                {formatoUsd(g.amountUsd)}
              </p>
            </div>
          ))}
          <div className="flex items-center justify-between bg-surface-secondary/50 p-3 text-[13px] font-semibold">
            <span className="text-txt-primary">Total</span>
            <span className="text-txt-primary">{formatoUsd(datos.gastoAdquisicionTotal)}</span>
          </div>
        </div>
      )}

      <div className="mt-3">
        <FormularioGasto />
      </div>
    </div>
  );

  const tabCostoIa = (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DatoHeroe label="Gasto este mes" valor={formatoUsd(datos.costoIaEsteMes)} color="gold" icon={Bot} />
        <DatoHeroe label="Llamadas este mes" valor={datos.llamadasIaEsteMes} color="teal" />
        <DatoHeroe
          label="Costo por usuario activo"
          valor={datos.costoIaPorUsuarioActivo === null ? "—" : formatoUsd(datos.costoIaPorUsuarioActivo)}
          color="coral"
        />
        <DatoHeroe label="% de los ingresos" valor="No medido" color="neutral" />
      </div>

      <div className="mt-3">
        <GraficoCostoIa datos={datos.costoIaUltimos14Dias} />
      </div>

      <h3 className="mt-6 text-[13.5px] font-semibold text-txt-primary">Costo por modelo (este mes)</h3>
      {datos.costoIaPorModelo.length === 0 ? (
        <div className="mt-2 rounded-xl border border-dashed border-border-strong bg-surface-secondary/40 p-3.5 text-[12.5px] text-txt-tertiary">
          Todavía no hay llamadas registradas este mes.
        </div>
      ) : (
        <div className="mt-2 overflow-hidden rounded-xl border border-border-default/60">
          {datos.costoIaPorModelo.map((m) => (
            <div
              key={m.model}
              className="flex items-center justify-between border-b border-border-default/40 p-3 text-[13px] last:border-0"
            >
              <div>
                <p className="font-medium text-txt-primary">{m.model}</p>
                <p className="text-[11.5px] text-txt-tertiary">{m.llamadas} llamadas</p>
              </div>
              <p className="font-display text-[16px] font-semibold text-txt-primary">{formatoUsd(m.costoUsd)}</p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3">
        <NoMedido>
          💡 Estos costos son un estimado con precios públicos de Anthropic — no reemplazan tu
          factura real, pero sirven para detectar a tiempo si la IA se está comiendo el margen.
        </NoMedido>
      </div>
    </div>
  );

  const tabs: TabAdmin[] = [
    { id: "resumen", label: "Resumen", content: tabResumen },
    { id: "ventas", label: "Ventas", content: tabVentas },
    { id: "usuarios", label: "Usuarios", content: tabUsuarios },
    { id: "salud", label: "Salud", content: tabSalud },
    { id: "uso", label: "Uso", content: tabUso },
    { id: "negocio", label: "Negocio", content: tabNegocio },
    { id: "costo-ia", label: "Costo de IA", content: tabCostoIa },
  ];

  return (
    <div className="min-h-dvh bg-gradient-to-b from-brand-primary-soft/40 via-surface-base to-surface-base px-4 pb-16 pt-6 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-[22px] font-semibold text-txt-primary">Panel</h1>
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

        <div className="mt-6">
          <TabsShell tabs={tabs} />
        </div>
      </div>
    </div>
  );
}
