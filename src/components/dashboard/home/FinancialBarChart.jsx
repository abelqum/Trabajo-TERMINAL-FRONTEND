"use client";

import { useState } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SERIES_INICIALES = {
  ingresos: true,
  egresos: true,
  utilidad: true,
};

function formatearMoneda(valor) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(valor || 0));
}

function ToggleSerie({ activo, nombre, claseActiva, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 transition hover:bg-slate-50"
    >
      <span
        className={`relative h-6 w-11 rounded-full transition ${
          activo ? claseActiva : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
            activo ? "left-6" : "left-1"
          }`}
        />
      </span>

      <span className="text-xs font-black text-slate-700">{nombre}</span>
    </button>
  );
}

function TooltipMoneda({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
      <p className="mb-2 text-sm font-black text-slate-800">{label}</p>

      {payload.map((elemento) => (
        <p
          key={elemento.dataKey}
          className="mt-1 text-xs font-bold"
          style={{
            color: elemento.color,
          }}
        >
          {elemento.name}: {formatearMoneda(elemento.value)}
        </p>
      ))}
    </div>
  );
}

export default function FinancialBarChart({
  titulo,
  descripcion,
  datos,
  ejeX,
  controles,
}) {
  const [series, setSeries] = useState(SERIES_INICIALES);

  function alternarSerie(serie) {
    setSeries((actual) => ({
      ...actual,
      [serie]: !actual[serie],
    }));
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <h2 className="text-lg font-black text-slate-800">{titulo}</h2>

          <p className="mt-1 text-xs font-semibold text-slate-500">
            {descripcion}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {controles}

          <ToggleSerie
            activo={series.ingresos}
            nombre="Ingresos"
            claseActiva="bg-emerald-600"
            onClick={() => alternarSerie("ingresos")}
          />

          <ToggleSerie
            activo={series.egresos}
            nombre="Egresos"
            claseActiva="bg-red-600"
            onClick={() => alternarSerie("egresos")}
          />

          <ToggleSerie
            activo={series.utilidad}
            nombre="Utilidad"
            claseActiva="bg-blue-700"
            onClick={() => alternarSerie("utilidad")}
          />
        </div>
      </div>

      {datos?.length ? (
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={datos}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />

            <XAxis dataKey={ejeX} axisLine={false} tickLine={false} />

            <YAxis axisLine={false} tickLine={false} />

            <Tooltip content={<TooltipMoneda />} />

            <Legend />

            {series.ingresos && (
              <Bar
                dataKey="ingresos"
                name="Ingresos"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
              />
            )}

            {series.egresos && (
              <Bar
                dataKey="egresos"
                name="Egresos"
                fill="#ef4444"
                radius={[6, 6, 0, 0]}
              />
            )}

            {series.utilidad && (
              <Bar
                dataKey="utilidad"
                name="Utilidad"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-80 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
          <p className="font-bold text-slate-400">
            No hay información disponible.
          </p>
        </div>
      )}
    </section>
  );
}
