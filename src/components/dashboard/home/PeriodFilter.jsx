"use client";

import { Search } from "lucide-react";

export default function PeriodFilter({
  desde,
  hasta,
  onDesdeChange,
  onHastaChange,
  onAplicar,
  cargando = false,
}) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      <div>
        <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
          Desde
        </label>

        <input
          type="month"
          value={desde}
          onChange={(event) => onDesdeChange(event.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
        />
      </div>

      <div>
        <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
          Hasta
        </label>

        <input
          type="month"
          value={hasta}
          onChange={(event) => onHastaChange(event.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
        />
      </div>

      <button
        type="button"
        onClick={onAplicar}
        disabled={cargando || !desde || !hasta}
        className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {cargando ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : (
          <Search size={15} />
        )}
        Aplicar
      </button>
    </div>
  );
}
