"use client";

import Link from "next/link";

import { Calendar, CheckCircle2, ListTodo } from "lucide-react";

function formatearFecha(valor) {
  if (!valor) {
    return "Sin fecha límite";
  }

  const fecha = new Date(`${valor}T12:00:00`);

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
  }).format(fecha);
}

export default function EmployeeDashboard({ datos }) {
  const nombre = datos?.usuario?.nombre?.trim()?.split(" ")[0] ?? "Usuario";

  const tareas = datos?.tareasPendientes ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-3xl bg-blue-700 p-8 text-white shadow-lg">
        <h1 className="text-3xl font-black">¡Bienvenido(a), {nombre}!</h1>

        <p className="mt-3 text-sm font-medium text-blue-100">
          Consulta tus próximas actividades y administra tus tareas desde el
          módulo correspondiente.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-800">
            <ListTodo className="text-blue-700" />
            Próximas tareas
          </h2>

          <Link
            href="/dashboard/tareas"
            className="text-xs font-black uppercase tracking-wider text-blue-700 hover:text-blue-900"
          >
            Ver todas
          </Link>
        </div>

        {tareas.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
            <CheckCircle2 size={38} className="mx-auto mb-3 text-emerald-500" />

            <p className="font-black text-slate-700">
              No tienes tareas pendientes
            </p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {tareas.map((tarea) => (
              <article
                key={tarea.id}
                className="rounded-2xl border border-slate-200 p-5 transition hover:border-blue-200 hover:shadow-sm"
              >
                <h3 className="font-black text-slate-800">{tarea.titulo}</h3>

                <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                  {tarea.descripcion || "Sin descripción adicional."}
                </p>

                <p className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-500">
                  <Calendar size={14} />

                  {formatearFecha(tarea.fechaLimite)}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
