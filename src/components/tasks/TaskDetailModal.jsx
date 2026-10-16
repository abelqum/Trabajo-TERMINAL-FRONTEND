"use client";

import { useState } from "react";

import {
  AlignLeft,
  Calendar,
  CheckCircle2,
  Edit3,
  Eye,
  MessageSquareWarning,
  Play,
  Save,
  Send,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";

import Swal from "sweetalert2";

import TaskEvidence from "./TaskEvidence";

import {
  crearEstadoInicialTarea,
  obtenerNombreEstado,
  obtenerNombrePrioridad,
  parseTaskForm,
  TASK_PRIORITIES,
} from "@/validations/taskSchema";

export default function TaskDetailModal({
  tarea,
  usuarios,
  procesando,
  onClose,
  onActualizar,
  onCambiarEstado,
  onEliminar,
  onRetroalimentar,
}) {
  const [editando, setEditando] = useState(false);

  const [mostrandoRetroalimentacion, setMostrandoRetroalimentacion] =
    useState(false);

  const [retroalimentacion, setRetroalimentacion] = useState("");

  const [form, setForm] = useState(() => crearEstadoInicialTarea(tarea));

  if (!tarea) {
    return null;
  }

  const nombresAsignados = tarea.asignados
    .map((usuario) => usuario.nombre)
    .join(", ");

  const puedeIrA = (estado) =>
    tarea.permisos.estadosPermitidos.includes(estado);

  function actualizar(campo, valor) {
    setForm((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  function alternarUsuario(id) {
    const valor = String(id);

    setForm((actual) => ({
      ...actual,

      asignadosIds: actual.asignadosIds.includes(valor)
        ? actual.asignadosIds.filter((usuarioId) => usuarioId !== valor)
        : [...actual.asignadosIds, valor],
    }));
  }

  async function guardar() {
    const validacion = parseTaskForm(form);

    if (!validacion.success) {
      const mensaje = Object.values(validacion.errors)[0];

      await Swal.fire({
        icon: "warning",
        title: "Revisa la información",
        text: mensaje,
      });

      return;
    }

    await onActualizar(validacion.data);

    setEditando(false);
  }

  async function enviarRetroalimentacion() {
    if (!retroalimentacion.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "Retroalimentación requerida",
        text: "Indica qué debe corregirse.",
      });

      return;
    }

    await onRetroalimentar(retroalimentacion.trim());

    setRetroalimentacion("");

    setMostrandoRetroalimentacion(false);
  }

  function formatearFecha(fecha) {
    if (!fecha) {
      return "Sin fecha límite";
    }

    return new Intl.DateTimeFormat("es-MX", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date(fecha));
  }

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 bg-slate-50 px-6 py-5">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-lg bg-brand-100 px-2.5 py-1 text-[10px] font-black uppercase text-brand-700">
                {obtenerNombreEstado(tarea.estado)}
              </span>

              <span className="rounded-lg bg-white px-2.5 py-1 text-[10px] font-black uppercase text-slate-500">
                {obtenerNombrePrioridad(tarea.prioridad)}
              </span>
            </div>

            <h2 className="mt-3 text-xl font-black text-slate-800">
              {tarea.titulo}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Asignada por {tarea.creador?.nombre || "Usuario"}
            </p>
          </div>

          <div className="flex gap-2">
            {tarea.permisos.editar && !editando && (
              <button
                type="button"
                onClick={() => {
                  setForm(crearEstadoInicialTarea(tarea));

                  setEditando(true);
                }}
                className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:text-brand-700"
              >
                <Edit3 size={18} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              disabled={procesando}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-500"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 space-y-6 overflow-y-auto p-6">
          {tarea.retroalimentacion && tarea.estado !== "COMPLETADA" && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-700">
                <MessageSquareWarning size={17} />
                Retroalimentación
              </h3>

              <p className="mt-3 whitespace-pre-wrap text-sm font-semibold text-amber-900">
                {tarea.retroalimentacion}
              </p>
            </section>
          )}

          {editando ? (
            <section className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-600">
                  Título
                </label>

                <input
                  value={form.titulo}
                  onChange={(event) => actualizar("titulo", event.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-600">
                  Descripción
                </label>

                <textarea
                  rows={4}
                  value={form.descripcion}
                  onChange={(event) =>
                    actualizar("descripcion", event.target.value)
                  }
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-600">
                    Fecha límite
                  </label>

                  <input
                    type="datetime-local"
                    value={form.fechaLimite}
                    onChange={(event) =>
                      actualizar("fechaLimite", event.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-600">
                    Prioridad
                  </label>

                  <select
                    value={form.prioridad}
                    onChange={(event) =>
                      actualizar("prioridad", event.target.value)
                    }
                    className={inputClass}
                  >
                    {TASK_PRIORITIES.map((prioridad) => (
                      <option key={prioridad.value} value={prioridad.value}>
                        {prioridad.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-widest text-slate-600">
                  Personas asignadas
                </p>

                <div className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
                  {usuarios.map((usuario) => (
                    <label
                      key={usuario.id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl p-3 hover:bg-slate-100"
                    >
                      <input
                        type="checkbox"
                        checked={form.asignadosIds.includes(String(usuario.id))}
                        onChange={() => alternarUsuario(usuario.id)}
                        className="h-4 w-4 accent-brand-700"
                      />

                      <span className="font-semibold text-slate-700">
                        {usuario.nombre}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditando(false)}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-xs font-black uppercase text-slate-600"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={guardar}
                  disabled={procesando}
                  className="flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-xs font-black uppercase text-white"
                >
                  <Save size={15} />
                  Guardar
                </button>
              </div>
            </section>
          ) : (
            <>
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-700">
                  <AlignLeft size={17} />
                  Descripción
                </h3>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                    {tarea.descripcion || "Sin instrucciones adicionales."}
                  </p>
                </div>
              </section>

              <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <Calendar size={20} className="text-orange-600" />

                  <p className="mt-3 text-[10px] font-black uppercase text-slate-400">
                    Fecha límite
                  </p>

                  <p className="mt-1 text-sm font-black text-slate-800">
                    {formatearFecha(tarea.fechaLimite)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  {tarea.asignados.length > 1 ? (
                    <Users size={20} className="text-brand-700" />
                  ) : (
                    <User size={20} className="text-brand-700" />
                  )}

                  <p className="mt-3 text-[10px] font-black uppercase text-slate-400">
                    Asignada a
                  </p>

                  <p className="mt-1 text-sm font-black text-slate-800">
                    {nombresAsignados || "Nadie"}
                  </p>
                </div>
              </section>
            </>
          )}

          <TaskEvidence tarea={tarea} />

          {mostrandoRetroalimentacion && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <label>
                <span className="text-xs font-black uppercase tracking-widest text-amber-700">
                  ¿Qué debe corregirse?
                </span>

                <textarea
                  rows={4}
                  value={retroalimentacion}
                  onChange={(event) => setRetroalimentacion(event.target.value)}
                  className="mt-2 w-full resize-none rounded-xl border border-amber-300 bg-white p-4 text-sm outline-none"
                />
              </label>

              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMostrandoRetroalimentacion(false)}
                  className="rounded-xl border border-amber-300 px-4 py-2 text-xs font-black text-amber-700"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={enviarRetroalimentacion}
                  className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-black text-white"
                >
                  Enviar corrección
                </button>
              </div>
            </section>
          )}
        </main>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-between">
          <div>
            {tarea.permisos.eliminar && (
              <button
                type="button"
                onClick={onEliminar}
                disabled={procesando}
                className="flex items-center gap-2 rounded-xl bg-red-50 px-5 py-3 text-xs font-black uppercase text-red-700 hover:bg-red-600 hover:text-white"
              >
                <Trash2 size={15} />
                Eliminar
              </button>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            {tarea.estado === "PENDIENTE" && puedeIrA("EN_PROGRESO") && (
              <button
                type="button"
                onClick={() => onCambiarEstado("EN_PROGRESO")}
                className="flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-xs font-black uppercase text-white"
              >
                <Play size={15} />
                Iniciar
              </button>
            )}

            {tarea.estado === "EN_PROGRESO" && puedeIrA("REVISION") && (
              <button
                type="button"
                onClick={() => onCambiarEstado("REVISION")}
                className="flex items-center gap-2 rounded-xl bg-purple-700 px-5 py-3 text-xs font-black uppercase text-white"
              >
                <Send size={15} />
                Enviar a revisión
              </button>
            )}

            {tarea.estado === "REVISION" && tarea.permisos.retroalimentar && (
              <button
                type="button"
                onClick={() => setMostrandoRetroalimentacion(true)}
                className="flex items-center gap-2 rounded-xl bg-amber-100 px-5 py-3 text-xs font-black uppercase text-amber-800"
              >
                <MessageSquareWarning size={15} />
                Retroalimentar
              </button>
            )}

            {tarea.estado === "REVISION" && puedeIrA("COMPLETADA") && (
              <button
                type="button"
                onClick={() => onCambiarEstado("COMPLETADA")}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-black uppercase text-white"
              >
                <CheckCircle2 size={15} />
                Completar
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
