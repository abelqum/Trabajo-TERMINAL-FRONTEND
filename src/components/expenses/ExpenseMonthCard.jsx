"use client";

import { BriefcaseBusiness, DollarSign, Plus, ReceiptText } from "lucide-react";

import { obtenerNombreCategoria } from "@/validations/expenseSchema";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function formatearDinero(valor) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(valor ?? 0));
}

function formatearFecha(fecha) {
  if (!fecha) {
    return "Sin fecha";
  }

  const valor = new Date(`${fecha}T12:00:00`);

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
  }).format(valor);
}

export default function ExpenseMonthCard({ datos, onNuevo, onEditar }) {
  const registrados = datos.egresos.filter(
    (egreso) => egreso.origen === "REGISTRADO",
  );

  const viaticos = datos.egresos.filter(
    (egreso) => egreso.origen === "VIATICO",
  );

  const nombreMes = MESES[Math.max(0, datos.mes - 1)];

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <button
        type="button"
        onClick={() => onNuevo(datos.periodo)}
        className="flex w-full items-center justify-between bg-slate-800 px-5 py-4 text-left text-white transition hover:bg-slate-900"
      >
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">
            {datos.anio}
          </p>

          <h3 className="text-xl font-black">{nombreMes}</h3>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Total mensual
          </p>

          <p className="text-lg font-black">{formatearDinero(datos.total)}</p>
        </div>
      </button>

      <div className="space-y-5 p-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-brand-50 p-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-600">
              Registrados
            </p>

            <p className="mt-1 text-sm font-black text-brand-950">
              {formatearDinero(datos.totalRegistrados)}
            </p>

            <p className="mt-1 text-[10px] font-semibold text-brand-600/70">
              {datos.cantidadRegistrados} registros
            </p>
          </div>

          <div className="rounded-2xl bg-amber-50 p-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
              Viáticos
            </p>

            <p className="mt-1 text-sm font-black text-amber-950">
              {formatearDinero(datos.totalViaticos)}
            </p>

            <p className="mt-1 text-[10px] font-semibold text-amber-700/70">
              {datos.cantidadViaticos} gastos
            </p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <ReceiptText size={13} />
              Egresos registrados
            </h4>

            <button
              type="button"
              onClick={() => onNuevo(datos.periodo)}
              className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-700 hover:text-brand-900"
            >
              <Plus size={12} />
              Agregar
            </button>
          </div>

          <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
            {registrados.map((egreso) => (
              <button
                type="button"
                key={`egreso-${egreso.id}`}
                onClick={() => onEditar(egreso)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-brand-300 hover:bg-brand-50"
              >
                <div className="min-w-0 pr-3">
                  <p className="truncate text-xs font-black text-slate-800">
                    {egreso.concepto}
                  </p>

                  <p className="mt-1 text-[10px] font-bold text-slate-500">
                    {formatearFecha(egreso.fecha)} ·{" "}
                    {obtenerNombreCategoria(egreso.categoria)}
                  </p>
                </div>

                <p className="shrink-0 text-xs font-black text-slate-800">
                  {formatearDinero(egreso.monto)}
                </p>
              </button>
            ))}

            {registrados.length === 0 && (
              <button
                type="button"
                onClick={() => onNuevo(datos.periodo)}
                className="w-full rounded-2xl border border-dashed border-slate-300 bg-white py-7 text-center transition hover:border-brand-400 hover:bg-brand-50"
              >
                <DollarSign size={22} className="mx-auto mb-2 text-slate-300" />

                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Sin egresos registrados
                </p>
              </button>
            )}
          </div>
        </div>

        {viaticos.length > 0 && (
          <div className="border-t border-slate-100 pt-4">
            <h4 className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-700">
              <BriefcaseBusiness size={13} />
              Viáticos aprobados
            </h4>

            <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
              {viaticos.map((egreso) => (
                <div
                  key={`viatico-${egreso.id}`}
                  className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-3"
                >
                  <div className="min-w-0 pr-3">
                    <p className="truncate text-xs font-black text-slate-800">
                      {egreso.descripcion ||
                        obtenerNombreCategoria(egreso.categoria) ||
                        "Gasto de viático"}
                    </p>

                    <p className="mt-1 truncate text-[10px] font-bold text-amber-700">
                      {formatearFecha(egreso.fecha)}

                      {" · "}

                      {egreso.viaje?.nombre ||
                        egreso.viaje?.destino ||
                        "Viático"}
                    </p>
                  </div>

                  <p className="shrink-0 text-xs font-black text-amber-900">
                    {formatearDinero(egreso.monto)}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-2 text-[10px] font-semibold text-slate-400">
              Los viáticos se administran desde el módulo de Viáticos.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
