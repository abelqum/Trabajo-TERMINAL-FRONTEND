"use client";

import { useMemo, useState } from "react";

import { CalendarClock, ChevronDown, ChevronUp } from "lucide-react";

import TaskCard from "./TaskCard";

const LIMITE_TAREAS = 6;

const INCREMENTO_TAREAS = 6;

const LIMITE_FECHAS = 4;

const INCREMENTO_FECHAS = 4;

function obtenerClaveFecha(fechaString) {
  if (!fechaString) {
    return "sin_fecha";
  }

  const fecha = new Date(fechaString);

  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(fecha.getDate()).padStart(2, "0")}`;
}

function formatearEncabezado(clave) {
  if (clave === "sin_fecha") {
    return {
      titulo: "Sin fecha límite",

      subtitulo: "Actividades sin fecha definida",
    };
  }

  const [anio, mes, dia] = clave.split("-").map(Number);

  const fecha = new Date(anio, mes - 1, dia);

  const hoy = new Date();

  hoy.setHours(0, 0, 0, 0);

  const manana = new Date(hoy);

  manana.setDate(manana.getDate() + 1);

  let tituloEspecial = "";

  if (fecha.getTime() === hoy.getTime()) {
    tituloEspecial = "Hoy";
  } else if (fecha.getTime() === manana.getTime()) {
    tituloEspecial = "Mañana";
  }

  const fechaFormateada = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fecha);

  return {
    titulo: tituloEspecial || fechaFormateada,

    subtitulo: tituloEspecial ? fechaFormateada : "",
  };
}

export default function TaskDateView({
  tareas,
  procesandoId,
  onAbrirDetalle,
  onCambiarEstado,
}) {
  const [limiteFechas, setLimiteFechas] = useState(LIMITE_FECHAS);

  const [limitesPorFecha, setLimitesPorFecha] = useState({});

  const grupos = useMemo(() => {
    const mapa = new Map();

    tareas.forEach((tarea) => {
      const clave = obtenerClaveFecha(tarea.fechaLimite);

      if (!mapa.has(clave)) {
        mapa.set(clave, []);
      }

      mapa.get(clave).push(tarea);
    });

    return [...mapa.entries()].sort(([a], [b]) => {
      if (a === "sin_fecha") {
        return 1;
      }

      if (b === "sin_fecha") {
        return -1;
      }

      return a.localeCompare(b);
    });
  }, [tareas]);

  const gruposVisibles = grupos.slice(0, limiteFechas);

  const fechasRestantes = Math.max(grupos.length - limiteFechas, 0);

  function obtenerLimite(clave) {
    return limitesPorFecha[clave] ?? LIMITE_TAREAS;
  }

  return (
    <div className="space-y-6">
      {gruposVisibles.map(([clave, tareasFecha]) => {
        const encabezado = formatearEncabezado(clave);

        const limite = obtenerLimite(clave);

        const visibles = tareasFecha.slice(0, limite);

        const restantes = Math.max(tareasFecha.length - limite, 0);

        return (
          <section
            key={clave}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <header className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div className="rounded-xl bg-brand-100 p-2.5 text-brand-700">
                <CalendarClock size={20} />
              </div>

              <div>
                <h2 className="text-lg font-black capitalize text-slate-800">
                  {encabezado.titulo}
                </h2>

                {encabezado.subtitulo && (
                  <p className="mt-0.5 text-xs font-semibold capitalize text-slate-400">
                    {encabezado.subtitulo}
                  </p>
                )}
              </div>

              <span className="ml-auto rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-600">
                {tareasFecha.length} tareas
              </span>
            </header>

            <div className="p-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {visibles.map((tarea) => (
                  <TaskCard
                    key={tarea.id}
                    tarea={tarea}
                    procesando={String(procesandoId) === String(tarea.id)}
                    onClick={() => onAbrirDetalle(tarea)}
                    onCambiarEstado={(estado) => onCambiarEstado(tarea, estado)}
                  />
                ))}
              </div>

              {(restantes > 0 || limite > LIMITE_TAREAS) && (
                <div className="mt-5 flex justify-center gap-3 border-t border-slate-100 pt-4">
                  {restantes > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setLimitesPorFecha((actual) => ({
                          ...actual,

                          [clave]: limite + INCREMENTO_TAREAS,
                        }))
                      }
                      className="flex items-center gap-2 rounded-xl bg-brand-50 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-brand-700"
                    >
                      <ChevronDown size={16} />
                      Ver más
                    </button>
                  )}

                  {limite > LIMITE_TAREAS && (
                    <button
                      type="button"
                      onClick={() =>
                        setLimitesPorFecha((actual) => ({
                          ...actual,

                          [clave]: LIMITE_TAREAS,
                        }))
                      }
                      className="flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-600"
                    >
                      <ChevronUp size={16} />
                      Mostrar menos
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        );
      })}

      {(fechasRestantes > 0 || limiteFechas > LIMITE_FECHAS) && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5">
          {fechasRestantes > 0 && (
            <button
              type="button"
              onClick={() =>
                setLimiteFechas((actual) => actual + INCREMENTO_FECHAS)
              }
              className="flex items-center gap-2 rounded-xl bg-brand-700 px-6 py-3 text-xs font-black uppercase tracking-wider text-white"
            >
              <ChevronDown size={16} />
              Ver más fechas
            </button>
          )}

          {limiteFechas > LIMITE_FECHAS && (
            <button
              type="button"
              onClick={() => setLimiteFechas(LIMITE_FECHAS)}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500"
            >
              <ChevronUp size={16} />
              Mostrar menos
            </button>
          )}
        </div>
      )}
    </div>
  );
}
