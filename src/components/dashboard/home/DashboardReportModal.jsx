"use client";

import { Download, X } from "lucide-react";

const OPCIONES = [
  {
    clave: "resumen",
    nombre: "Resumen financiero",
  },
  {
    clave: "historica",
    nombre: "Evolución histórica",
  },
  {
    clave: "mensual",
    nombre: "Evolución mensual",
  },
  {
    clave: "distribucion",
    nombre: "Distribución financiera",
  },
  {
    clave: "categorias",
    nombre: "Egresos por categoría",
  },
];

export default function DashboardReportModal({
  abierto,
  opciones,
  onCambiarOpcion,
  onCerrar,
  onGenerar,
  generando,
}) {
  if (!abierto) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Generar reporte
            </h2>

            <p className="mt-1 text-xs font-medium text-slate-500">
              Selecciona los elementos que deseas incluir.
            </p>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            disabled={generando}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={21} />
          </button>
        </div>

        <div className="space-y-3 p-6">
          {OPCIONES.map((opcion) => (
            <label
              key={opcion.clave}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={opciones[opcion.clave]}
                onChange={() => onCambiarOpcion(opcion.clave)}
                className="h-5 w-5 accent-blue-700"
              />

              <span className="font-bold text-slate-700">{opcion.nombre}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5">
          <button
            type="button"
            onClick={onCerrar}
            disabled={generando}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-700 transition hover:bg-slate-100"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onGenerar}
            disabled={generando}
            className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generando ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Download size={16} />
            )}

            {generando ? "Generando..." : "Generar PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
