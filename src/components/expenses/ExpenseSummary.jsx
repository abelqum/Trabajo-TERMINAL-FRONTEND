"use client";

import { Banknote, BriefcaseBusiness, ReceiptText } from "lucide-react";

function formatearDinero(valor) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(valor ?? 0));
}

export default function ExpenseSummary({ resumen, desde, hasta }) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <article className="rounded-3xl bg-slate-800 p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
              Egreso total
            </p>

            <p className="mt-3 text-3xl font-black">
              {formatearDinero(resumen.total)}
            </p>

            <p className="mt-2 text-xs font-semibold text-slate-400">
              {desde} — {hasta}
            </p>
          </div>

          <div className="rounded-xl bg-white/10 p-3">
            <Banknote size={22} />
          </div>
        </div>
      </article>

      <article className="rounded-3xl border border-brand-100 bg-brand-50 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-600">
              Egresos registrados
            </p>

            <p className="mt-3 text-2xl font-black text-brand-950">
              {formatearDinero(resumen.totalRegistrados)}
            </p>

            <p className="mt-2 text-xs font-semibold text-brand-700/70">
              {resumen.cantidadRegistrados} registros
            </p>
          </div>

          <div className="rounded-xl bg-white/70 p-3 text-brand-700">
            <ReceiptText size={21} />
          </div>
        </div>
      </article>

      <article className="rounded-3xl border border-amber-100 bg-amber-50 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
              Viáticos aprobados
            </p>

            <p className="mt-3 text-2xl font-black text-amber-950">
              {formatearDinero(resumen.totalViaticos)}
            </p>

            <p className="mt-2 text-xs font-semibold text-amber-700/70">
              {resumen.cantidadViaticos} gastos
            </p>
          </div>

          <div className="rounded-xl bg-white/70 p-3 text-amber-700">
            <BriefcaseBusiness size={21} />
          </div>
        </div>
      </article>
    </section>
  );
}
