"use client";

import { useState } from "react";

import { CalendarRange, Search } from "lucide-react";

export default function ExpensePeriodFilter({
  desdeInicial,
  hastaInicial,
  cargando,
  onAplicar,
}) {
  const [desde, setDesde] = useState(desdeInicial);

  const [hasta, setHasta] = useState(hastaInicial);

  const rangoValido = desde && hasta && desde <= hasta;

  function handleSubmit(event) {
    event.preventDefault();

    if (!rangoValido) {
      return;
    }

    onAplicar({
      desde,
      hasta,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center gap-2">
        <CalendarRange size={18} className="text-brand-700" />

        <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">
          Periodo a consultar
        </h2>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <label className="flex-1 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Desde
          </span>

          <input
            type="month"
            value={desde}
            onChange={(event) => setDesde(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10"
          />
        </label>

        <label className="flex-1 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Hasta
          </span>

          <input
            type="month"
            value={hasta}
            onChange={(event) => setHasta(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10"
          />
        </label>

        <button
          type="submit"
          disabled={cargando || !rangoValido}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {cargando ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <Search size={16} />
          )}
          Consultar
        </button>
      </div>

      {!rangoValido && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
          El periodo inicial no puede ser posterior al periodo final.
        </p>
      )}
    </form>
  );
}
