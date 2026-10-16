"use client";

import { ArrowDownRight, ArrowUpRight, Banknote, Percent } from "lucide-react";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import PeriodFilter from "./PeriodFilter";

function formatearMoneda(valor) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(valor || 0));
}

export default function FinancialSummary({
  resumen,
  desde,
  hasta,
  onDesdeChange,
  onHastaChange,
  onAplicar,
  cargando,
}) {
  const ingresos = Number(resumen?.ingresos ?? 0);

  const egresos = Number(resumen?.egresosTotales ?? 0);

  const utilidad = Number(resumen?.utilidad ?? 0);

  const margen = Number(resumen?.margen ?? 0);

  let datosPastel;

  if (ingresos === 0 && egresos === 0) {
    datosPastel = [
      {
        nombre: "Sin movimientos",
        valor: 1,
        color: "#cbd5e1",
      },
    ];
  } else if (utilidad >= 0) {
    datosPastel = [
      {
        nombre: "Egresos",
        valor: egresos,
        color: "#ef4444",
      },
      {
        nombre: "Utilidad",
        valor: utilidad,
        color: "#10b981",
      },
    ].filter((elemento) => elemento.valor > 0);
  } else {
    datosPastel = [
      {
        nombre: "Ingresos",
        valor: ingresos,
        color: "#10b981",
      },
      {
        nombre: "Déficit",
        valor: Math.abs(utilidad),
        color: "#f59e0b",
      },
    ];
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <h2 className="text-lg font-black text-slate-800">
            Distribución financiera del periodo
          </h2>

          <p className="mt-1 text-xs font-semibold text-slate-500">
            Analiza los ingresos y egresos de un periodo específico.
          </p>
        </div>

        <PeriodFilter
          desde={desde}
          hasta={hasta}
          onDesdeChange={onDesdeChange}
          onHastaChange={onHastaChange}
          onAplicar={onAplicar}
          cargando={cargando}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-span-3">
          <article className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <ArrowUpRight className="text-emerald-600" />

            <p className="mt-4 text-xs font-black uppercase tracking-widest text-emerald-700">
              Ingresos
            </p>

            <p className="mt-2 text-2xl font-black text-emerald-900">
              {formatearMoneda(ingresos)}
            </p>
          </article>

          <article className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <ArrowDownRight className="text-red-600" />

            <p className="mt-4 text-xs font-black uppercase tracking-widest text-red-700">
              Egresos
            </p>

            <p className="mt-2 text-2xl font-black text-red-900">
              {formatearMoneda(egresos)}
            </p>
          </article>

          <article className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <Banknote className="text-blue-700" />

            <p className="mt-4 text-xs font-black uppercase tracking-widest text-blue-700">
              {utilidad >= 0 ? "Utilidad" : "Déficit"}
            </p>

            <p className="mt-2 text-2xl font-black text-blue-950">
              {formatearMoneda(utilidad)}
            </p>
          </article>

          <article className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
            <Percent className="text-violet-700" />

            <p className="mt-4 text-xs font-black uppercase tracking-widest text-violet-700">
              Margen
            </p>

            <p className="mt-2 text-2xl font-black text-violet-950">
              {margen.toFixed(1)}%
            </p>
          </article>
        </div>

        <div className="relative xl:col-span-2">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={datosPastel}
                dataKey="valor"
                nameKey="nombre"
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={120}
                paddingAngle={3}
              >
                {datosPastel.map((elemento) => (
                  <Cell key={elemento.nombre} fill={elemento.color} />
                ))}
              </Pie>

              <Tooltip formatter={(valor) => formatearMoneda(valor)} />

              <Legend />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Ingresos
            </p>

            <p className="text-base font-black text-slate-800">
              {formatearMoneda(ingresos)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Egresos registrados
          </p>

          <p className="mt-1 font-black text-slate-700">
            {formatearMoneda(resumen?.egresosRegistrados)}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Viáticos
          </p>

          <p className="mt-1 font-black text-slate-700">
            {formatearMoneda(resumen?.viaticos)}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Pendiente por cobrar
          </p>

          <p className="mt-1 font-black text-slate-700">
            {formatearMoneda(resumen?.pendienteCobro)}
          </p>
        </div>
      </div>
    </section>
  );
}
