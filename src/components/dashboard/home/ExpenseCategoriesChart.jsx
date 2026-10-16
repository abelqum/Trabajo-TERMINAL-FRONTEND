"use client";

import { ReceiptText } from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import PeriodFilter from "./PeriodFilter";

function formatearMoneda(valor) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(valor || 0));
}

export default function ExpenseCategoriesChart({
  datos,
  desde,
  hasta,
  onDesdeChange,
  onHastaChange,
  onAplicar,
  cargando,
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <h2 className="text-lg font-black text-slate-800">
            Egresos por categoría
          </h2>

          <p className="mt-1 text-xs font-semibold text-slate-500">
            Muestra las categorías con mayor egreso durante el periodo.
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

      {!datos?.length ? (
        <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
          <div className="text-center">
            <ReceiptText size={38} className="mx-auto mb-3 text-slate-300" />

            <p className="font-black text-slate-500">
              No hay egresos en este periodo
            </p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={380}>
          <BarChart
            data={datos}
            layout="vertical"
            margin={{
              left: 35,
              right: 25,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#e2e8f0"
            />

            <XAxis type="number" axisLine={false} tickLine={false} />

            <YAxis
              type="category"
              dataKey="categoria"
              width={145}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip formatter={(valor) => formatearMoneda(valor)} />

            <Bar
              dataKey="total"
              name="Egreso"
              fill="#7c3aed"
              radius={[0, 6, 6, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}
