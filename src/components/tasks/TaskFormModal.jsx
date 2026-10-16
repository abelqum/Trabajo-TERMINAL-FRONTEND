"use client";

import { useMemo, useState } from "react";

import {
  CalendarDays,
  LoaderCircle,
  Save,
  UserRoundPlus,
  X,
} from "lucide-react";

import Swal from "sweetalert2";

import { tasksService } from "@/services/tasksService";

import {
  crearEstadoInicialTarea,
  parseTaskForm,
  TASK_PRIORITIES,
} from "@/validations/taskSchema";

export default function TaskFormModal({
  usuarioActual,
  usuarios,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState(() =>
    crearEstadoInicialTarea(null, usuarioActual),
  );

  const [errores, setErrores] = useState({});

  const [guardando, setGuardando] = useState(false);

  /*
   * Nos aseguramos de que el usuario actual aparezca
   * en la lista aunque el endpoint de opciones no lo
   * haya incluido por alguna razón.
   */
  const usuariosDisponibles = useMemo(() => {
    const mapa = new Map();

    if (usuarioActual?.id) {
      mapa.set(String(usuarioActual.id), usuarioActual);
    }

    (usuarios ?? []).forEach((usuario) => {
      if (usuario?.id) {
        mapa.set(String(usuario.id), usuario);
      }
    });

    return [...mapa.values()].sort((a, b) =>
      String(a.nombre ?? "").localeCompare(String(b.nombre ?? ""), "es", {
        sensitivity: "base",
      }),
    );
  }, [usuarios, usuarioActual]);

  function actualizar(campo, valor) {
    setForm((actual) => ({
      ...actual,

      [campo]: valor,
    }));

    setErrores((actuales) => {
      if (!actuales[campo]) {
        return actuales;
      }

      const nuevos = {
        ...actuales,
      };

      delete nuevos[campo];

      return nuevos;
    });
  }

  function alternarUsuario(id) {
    const valor = String(id);

    setForm((actual) => ({
      ...actual,

      asignadosIds: actual.asignadosIds.includes(valor)
        ? actual.asignadosIds.filter((usuarioId) => usuarioId !== valor)
        : [...actual.asignadosIds, valor],
    }));

    setErrores((actuales) => {
      if (!actuales.asignadosIds) {
        return actuales;
      }

      const nuevos = {
        ...actuales,
      };

      delete nuevos.asignadosIds;

      return nuevos;
    });
  }

  async function guardar() {
    if (guardando) {
      return;
    }

    const validacion = parseTaskForm(form);

    if (!validacion.success) {
      setErrores(validacion.errors);

      const mensaje = Object.values(validacion.errors)[0];

      await Swal.fire({
        icon: "warning",
        title: "Revisa la información",
        text: mensaje || "Hay campos que necesitan corrección.",
      });

      return;
    }

    setGuardando(true);

    try {
      const tarea = await tasksService.crearTarea(validacion.data);

      await Swal.fire({
        icon: "success",
        title: "Tarea creada",
        text: "La actividad fue registrada correctamente.",
        timer: 1300,
        showConfirmButton: false,
      });

      await onSaved?.(tarea);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo crear la tarea",
        text: error.message || "Ocurrió un error al registrar la actividad.",
      });
    } finally {
      setGuardando(false);
    }
  }

  function cerrarDesdeFondo(event) {
    if (event.target === event.currentTarget && !guardando) {
      onClose?.();
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10";

  const errorClass = "mt-1.5 text-xs font-bold text-red-600";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={cerrarDesdeFondo}
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-100 p-3 text-brand-700">
              <UserRoundPlus size={22} />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-800">Nueva tarea</h2>

              <p className="mt-0.5 text-xs font-semibold text-slate-500">
                Define la actividad, prioridad y responsables.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={guardando}
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X size={21} />
          </button>
        </header>

        <main className="overflow-y-auto p-6">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-600">
                Título
              </label>

              <input
                type="text"
                value={form.titulo}
                onChange={(event) => actualizar("titulo", event.target.value)}
                placeholder="Ej. Preparar pedido para cliente"
                maxLength={150}
                className={`${inputClass} ${
                  errores.titulo ? "border-red-400" : ""
                }`}
              />

              {errores.titulo && <p className={errorClass}>{errores.titulo}</p>}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-600">
                  Descripción
                </label>

                <span className="text-[10px] font-bold text-slate-400">
                  {form.descripcion.length}
                  /1000
                </span>
              </div>

              <textarea
                rows={4}
                value={form.descripcion}
                onChange={(event) =>
                  actualizar("descripcion", event.target.value)
                }
                placeholder="Agrega instrucciones o información necesaria..."
                maxLength={1000}
                className={`${inputClass} resize-none ${
                  errores.descripcion ? "border-red-400" : ""
                }`}
              />

              {errores.descripcion && (
                <p className={errorClass}>{errores.descripcion}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-600">
                  <CalendarDays size={15} />
                  Fecha límite
                </label>

                <input
                  type="datetime-local"
                  value={form.fechaLimite}
                  onChange={(event) =>
                    actualizar("fechaLimite", event.target.value)
                  }
                  className={`${inputClass} ${
                    errores.fechaLimite ? "border-red-400" : ""
                  }`}
                />

                {errores.fechaLimite && (
                  <p className={errorClass}>{errores.fechaLimite}</p>
                )}

                <p className="mt-1.5 text-[10px] font-semibold text-slate-400">
                  Puedes dejarla vacía.
                </p>
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
                  className={`${inputClass} ${
                    errores.prioridad ? "border-red-400" : ""
                  }`}
                >
                  {TASK_PRIORITIES.map((prioridad) => (
                    <option key={prioridad.value} value={prioridad.value}>
                      {prioridad.label}
                    </option>
                  ))}
                </select>

                {errores.prioridad && (
                  <p className={errorClass}>{errores.prioridad}</p>
                )}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-widest text-slate-600">
                  Personas asignadas
                </p>

                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-black text-brand-700">
                  {form.asignadosIds.length} seleccionadas
                </span>
              </div>

              <div
                className={`max-h-60 space-y-1 overflow-y-auto rounded-2xl border bg-slate-50 p-2 ${
                  errores.asignadosIds ? "border-red-400" : "border-slate-200"
                }`}
              >
                {!usuariosDisponibles.length ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm font-bold text-slate-500">
                      No hay usuarios disponibles.
                    </p>
                  </div>
                ) : (
                  usuariosDisponibles.map((usuario) => {
                    const seleccionado = form.asignadosIds.includes(
                      String(usuario.id),
                    );

                    const esActual =
                      String(usuario.id) === String(usuarioActual?.id);

                    return (
                      <label
                        key={usuario.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                          seleccionado
                            ? "border-brand-200 bg-brand-50"
                            : "border-transparent hover:bg-slate-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={seleccionado}
                          onChange={() => alternarUsuario(usuario.id)}
                          className="h-4 w-4 shrink-0 accent-brand-700"
                        />

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-700">
                            {usuario.nombre}

                            {esActual && (
                              <span className="ml-2 text-[10px] font-black uppercase text-brand-700">
                                Tú
                              </span>
                            )}
                          </p>

                          <p className="truncate text-[11px] font-medium text-slate-400">
                            {usuario.email}
                          </p>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>

              {errores.asignadosIds && (
                <p className={errorClass}>{errores.asignadosIds}</p>
              )}
            </div>
          </div>
        </main>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {guardando ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                Guardando
              </>
            ) : (
              <>
                <Save size={16} />
                Crear tarea
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}
