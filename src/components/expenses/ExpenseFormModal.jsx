"use client";

import { useState } from "react";

import { Save, Trash2, WalletCards, X } from "lucide-react";

import Swal from "sweetalert2";

import { expensesService } from "@/services/expensesService";

import {
  crearEstadoInicialEgreso,
  EXPENSE_CATEGORIES,
  parseExpenseForm,
} from "@/validations/expenseSchema";

export default function ExpenseFormModal({
  egreso = null,
  fechaInicial = null,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState(() =>
    crearEstadoInicialEgreso(egreso, fechaInicial),
  );

  const [errors, setErrors] = useState({});

  const [guardando, setGuardando] = useState(false);

  const editando = Boolean(egreso?.id);

  function actualizarCampo(campo, valor) {
    setForm((actual) => ({
      ...actual,
      [campo]: valor,
    }));

    if (errors[campo]) {
      setErrors((actual) => {
        const nuevos = {
          ...actual,
        };

        delete nuevos[campo];

        return nuevos;
      });
    }
  }

  async function guardarEgreso(event) {
    event.preventDefault();

    const validacion = parseExpenseForm(form);

    if (!validacion.success) {
      setErrors(validacion.errors);

      return;
    }

    setGuardando(true);

    try {
      if (editando) {
        await expensesService.actualizarEgreso(egreso.id, validacion.data);
      } else {
        await expensesService.crearEgreso(validacion.data);
      }

      await Swal.fire({
        icon: "success",

        title: editando ? "Egreso actualizado" : "Egreso registrado",

        timer: 1300,

        showConfirmButton: false,
      });

      onSaved();
    } catch (error) {
      console.error("Error guardando egreso:", error);

      await Swal.fire({
        icon: "error",

        title: "No se pudo guardar",

        text: error.message || "Ocurrió un error inesperado.",

        confirmButtonColor: "#dc2626",
      });
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarEgreso() {
    if (!egreso?.id) {
      return;
    }

    const confirmacion = await Swal.fire({
      icon: "warning",

      title: "¿Eliminar este egreso?",

      text: "Esta acción no se puede deshacer.",

      showCancelButton: true,

      confirmButtonText: "Sí, eliminar",

      cancelButtonText: "Cancelar",

      confirmButtonColor: "#dc2626",

      cancelButtonColor: "#64748b",

      reverseButtons: true,
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    setGuardando(true);

    try {
      await expensesService.eliminarEgreso(egreso.id);

      await Swal.fire({
        icon: "success",

        title: "Egreso eliminado",

        timer: 1200,

        showConfirmButton: false,
      });

      onSaved();
    } catch (error) {
      console.error("Error eliminando egreso:", error);

      await Swal.fire({
        icon: "error",

        title: "No se pudo eliminar",

        text: error.message || "Ocurrió un error inesperado.",
      });
    } finally {
      setGuardando(false);
    }
  }

  function claseInput(campo) {
    return `w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
      errors[campo]
        ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
        : "border-slate-300 focus:border-brand-700 focus:ring-brand-700/10"
    }`;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !guardando) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-brand-50 p-2.5 text-brand-700">
              <WalletCards size={21} />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-800">
                {editando ? "Editar egreso" : "Nuevo egreso"}
              </h2>

              <p className="mt-1 text-xs font-semibold text-slate-500">
                {editando
                  ? "Consulta o modifica la información registrada."
                  : "Registra un egreso general de la empresa."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            aria-label="Cerrar"
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={guardarEgreso} className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-700">
                Concepto *
              </span>

              <input
                type="text"
                value={form.concepto}
                onChange={(event) =>
                  actualizarCampo("concepto", event.target.value)
                }
                disabled={guardando}
                placeholder="Ej. Pago de electricidad"
                className={claseInput("concepto")}
              />

              {errors.concepto && (
                <p className="text-xs font-semibold text-red-600">
                  {errors.concepto}
                </p>
              )}
            </label>

            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-700">
                Categoría *
              </span>

              <select
                value={form.categoria}
                onChange={(event) =>
                  actualizarCampo("categoria", event.target.value)
                }
                disabled={guardando}
                className={claseInput("categoria")}
              >
                {EXPENSE_CATEGORIES.map((categoria) => (
                  <option key={categoria.value} value={categoria.value}>
                    {categoria.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-700">
                Fecha *
              </span>

              <input
                type="date"
                value={form.fecha}
                onChange={(event) =>
                  actualizarCampo("fecha", event.target.value)
                }
                disabled={guardando}
                className={claseInput("fecha")}
              />

              {errors.fecha && (
                <p className="text-xs font-semibold text-red-600">
                  {errors.fecha}
                </p>
              )}
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-700">
                Monto *
              </span>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-500">
                  $
                </span>

                <input
                  type="number"
                  min="0.01"
                  step="1"
                  value={form.monto}
                  onChange={(event) =>
                    actualizarCampo("monto", event.target.value)
                  }
                  disabled={guardando}
                  placeholder="0.00"
                  className={`${claseInput("monto")} pl-9`}
                />
              </div>

              {errors.monto && (
                <p className="text-xs font-semibold text-red-600">
                  {errors.monto}
                </p>
              )}
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-700">
                Descripción
              </span>

              <textarea
                rows={4}
                value={form.descripcion}
                onChange={(event) =>
                  actualizarCampo("descripcion", event.target.value)
                }
                disabled={guardando}
                placeholder="Detalles adicionales del egreso..."
                className={`${claseInput("descripcion")} resize-none`}
              />

              {errors.descripcion && (
                <p className="text-xs font-semibold text-red-600">
                  {errors.descripcion}
                </p>
              )}
            </label>
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between">
            <div>
              {editando && (
                <button
                  type="button"
                  onClick={eliminarEgreso}
                  disabled={guardando}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-5 py-3 text-xs font-black uppercase tracking-widest text-red-700 transition hover:bg-red-600 hover:text-white disabled:opacity-50 sm:w-auto"
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                disabled={guardando}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={guardando}
                className="flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-md transition hover:bg-brand-800 disabled:opacity-50"
              >
                {guardando ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  <Save size={16} />
                )}

                {guardando ? "Guardando..." : "Guardar egreso"}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}
