"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  page,
  totalPages,
  totalElements,
  onPageChange,
  disabled = false,
}) {
  if (totalPages <= 1 && totalElements <= 0) {
    return null;
  }

  const paginaActual = page + 1;

  const totalPaginas = Math.max(totalPages, 1);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-semibold text-slate-500">
        {totalElements} {totalElements === 1 ? "registro" : "registros"}
      </p>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <button
          type="button"
          disabled={disabled || page <= 0}
          onClick={() => onPageChange(page - 1)}
          className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          Anterior
        </button>

        <span className="text-xs font-black text-slate-600">
          Página {paginaActual} de {totalPaginas}
        </span>

        <button
          type="button"
          disabled={disabled || page >= totalPaginas - 1}
          onClick={() => onPageChange(page + 1)}
          className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
