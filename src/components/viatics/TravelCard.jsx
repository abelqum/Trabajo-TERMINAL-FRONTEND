"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  Pencil,
  Users,
  WalletCards,
} from "lucide-react";

function formatearMoneda(valor) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(valor ?? 0));
}

function formatearFecha(fecha) {
  if (!fecha) {
    return "—";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${fecha}T12:00:00`));
}

export default function TravelCard({ viaje, onAbrir, onEditar, onReporte }) {
  const finalizado = viaje.estatus === "FINALIZADO";

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onAbrir(viaje)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          onAbrir(viaje);
        }
      }}
      className={`relative cursor-pointer overflow-hidden rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        finalizado ? "border-emerald-300" : "border-slate-200"
      }`}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${
                finalizado
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-brand-100 text-brand-700"
              }`}
            >
              {finalizado ? "Finalizado" : "Activo"}
            </span>

            {viaje.resumen.gastosPendientes > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-amber-700">
                <Clock3 size={11} />
                {viaje.resumen.gastosPendientes} pendientes
              </span>
            )}
          </div>

          <h2 className="truncate text-lg font-black text-slate-800">
            {viaje.nombre}
          </h2>

          <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <MapPin size={13} />

            {viaje.destino}
          </p>
        </div>

        <div className="flex shrink-0 gap-1">
          {finalizado && (
            <button
              type="button"
              title="Generar liquidación"
              onClick={(event) => {
                event.stopPropagation();

                onReporte(viaje);
              }}
              className="rounded-xl p-2 text-emerald-600 transition hover:bg-emerald-50"
            >
              <FileText size={18} />
            </button>
          )}

          {viaje.permisos.editar && (
            <button
              type="button"
              title="Editar viaje"
              onClick={(event) => {
                event.stopPropagation();

                onEditar(viaje);
              }}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-brand-50 hover:text-brand-700"
            >
              <Pencil size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <CalendarDays size={15} className="text-slate-400" />

          {formatearFecha(viaje.fechaInicio)}

          <span>—</span>

          {formatearFecha(viaje.fechaFin)}

          <span className="text-slate-400">({viaje.dias} días)</span>
        </div>

        <div className="flex items-start gap-2 text-xs text-slate-600">
          <Users size={15} className="mt-0.5 shrink-0 text-slate-400" />

          <span className="line-clamp-2 font-semibold">
            {viaje.usuarios.length
              ? viaje.usuarios.map((usuario) => usuario.nombre).join(", ")
              : "Sin personal asignado"}
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
        <div className="rounded-2xl bg-brand-50 p-3">
          <p className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-brand-600">
            <WalletCards size={12} />
            Presupuesto
          </p>

          <p className="mt-1 text-sm font-black text-brand-950">
            {formatearMoneda(viaje.presupuesto.total)}
          </p>
        </div>

        <div
          className={`rounded-2xl p-3 ${
            viaje.resumen.saldo >= 0 ? "bg-emerald-50" : "bg-red-50"
          }`}
        >
          <p
            className={`text-[9px] font-black uppercase tracking-widest ${
              viaje.resumen.saldo >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {viaje.resumen.saldo >= 0 ? "Disponible" : "Excedente"}
          </p>

          <p
            className={`mt-1 text-sm font-black ${
              viaje.resumen.saldo >= 0 ? "text-emerald-950" : "text-red-950"
            }`}
          >
            {formatearMoneda(Math.abs(viaje.resumen.saldo))}
          </p>
        </div>
      </div>

      {finalizado && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-700">
          <CheckCircle2 size={14} />
          Cuentas cerradas
        </div>
      )}
    </article>
  );
}
