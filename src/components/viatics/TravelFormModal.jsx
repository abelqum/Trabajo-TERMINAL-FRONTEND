"use client";

import { useState } from "react";

import {
  CalendarDays,
  MapPin,
  Save,
  Trash2,
  Users,
  WalletCards,
  X,
} from "lucide-react";

import Swal from "sweetalert2";

import {
  calcularDiasViaje,
  calcularPresupuestoTotal,
  crearEstadoInicialViaje,
  parseTravelForm,
  VIATIC_CATEGORIES,
} from "@/validations/viaticSchema";

import { viaticsService } from "@/services/viaticsService";

export default function TravelFormModal({
  viaje = null,
  usuarios,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState(() => crearEstadoInicialViaje(viaje));

  const [errors, setErrors] = useState({});

  const [guardando, setGuardando] = useState(false);

  const editando = Boolean(viaje?.id);

  const dias = calcularDiasViaje(form.fechaInicio, form.fechaFin);

  const presupuestoTotal = calcularPresupuestoTotal(form.presupuesto);

  function actualizarCampo(campo, valor) {
    setForm((actual) => ({
      ...actual,
      [campo]: valor,
    }));

    setErrors((actual) => {
      const nuevos = {
        ...actual,
      };

      delete nuevos[campo];

      return nuevos;
    });
  }

  function actualizarPresupuesto(campo, valor) {
    setForm((actual) => ({
      ...actual,

      presupuesto: {
        ...actual.presupuesto,
        [campo]: valor,
      },
    }));

    setErrors((actual) => {
      const nuevos = {
        ...actual,
      };

      delete nuevos[`presupuesto.${campo}`];

      return nuevos;
    });
  }

  function alternarUsuario(id) {
    const valor = String(id);

    setForm((actual) => ({
      ...actual,

      usuariosIds: actual.usuariosIds.includes(valor)
        ? actual.usuariosIds.filter((usuarioId) => usuarioId !== valor)
        : [...actual.usuariosIds, valor],
    }));

    setErrors((actual) => {
      const nuevos = {
        ...actual,
      };

      delete nuevos.usuariosIds;

      return nuevos;
    });
  }

  async function guardar(event) {
    event.preventDefault();

    const validacion = parseTravelForm(form);

    if (!validacion.success) {
      setErrors(validacion.errors);

      return;
    }

    setGuardando(true);

    try {
      if (editando) {
        await viaticsService.actualizarViaje(viaje.id, validacion.data);
      } else {
        await viaticsService.crearViaje(validacion.data);
      }

      await Swal.fire({
        icon: "success",

        title: editando ? "Viaje actualizado" : "Viaje creado",

        timer: 1400,
        showConfirmButton: false,
      });

      onSaved();
    } catch (error) {
      console.error(error);

      await Swal.fire({
        icon: "error",

        title: "No se pudo guardar el viaje",

        text: error.message || "Ocurrió un error inesperado.",

        confirmButtonColor: "#dc2626",
      });
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarViaje() {
    const resultado = await Swal.fire({
      icon: "warning",

      title: "¿Eliminar viaje completo?",

      text: "Se eliminará el viaje, sus asignaciones, gastos y comprobantes.",

      showCancelButton: true,

      confirmButtonText: "Sí, eliminar",

      cancelButtonText: "Cancelar",

      confirmButtonColor: "#dc2626",

      reverseButtons: true,
    });

    if (!resultado.isConfirmed) {
      return;
    }

    setGuardando(true);

    try {
      await viaticsService.eliminarViaje(viaje.id);

      await Swal.fire({
        icon: "success",
        title: "Viaje eliminado",
        timer: 1300,
        showConfirmButton: false,
      });

      onSaved();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo eliminar",
        text: error.message,
      });
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarComprobantes() {
    const resultado = await Swal.fire({
      icon: "warning",

      title: "¿Eliminar comprobantes?",

      text: "Los gastos permanecerán registrados, pero se eliminarán sus imágenes.",

      showCancelButton: true,

      confirmButtonText: "Eliminar imágenes",

      cancelButtonText: "Cancelar",

      confirmButtonColor: "#d97706",

      reverseButtons: true,
    });

    if (!resultado.isConfirmed) {
      return;
    }

    setGuardando(true);

    try {
      await viaticsService.eliminarComprobantes(viaje.id);

      await Swal.fire({
        icon: "success",
        title: "Comprobantes eliminados",
        timer: 1300,
        showConfirmButton: false,
      });

      onSaved();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudieron eliminar",
        text: error.message,
      });
    } finally {
      setGuardando(false);
    }
  }

  const clasesInput =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-xl font-black text-slate-800">
              {editando ? "Editar viaje" : "Nuevo viaje"}
            </h2>

            <p className="mt-1 text-xs font-medium text-slate-500">
              Asigna personal y presupuesto por categoría.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </header>

        <form
          id="travel-form"
          onSubmit={guardar}
          className="flex-1 overflow-y-auto p-6"
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-700">
                <MapPin size={16} />
                Viaje
              </h3>

              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Nombre *
                </label>

                <input
                  value={form.nombre}
                  onChange={(event) =>
                    actualizarCampo("nombre", event.target.value)
                  }
                  className={clasesInput}
                />

                {errors.nombre && (
                  <p className="mt-1 text-xs font-bold text-red-600">
                    {errors.nombre}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Destino *
                </label>

                <input
                  value={form.destino}
                  onChange={(event) =>
                    actualizarCampo("destino", event.target.value)
                  }
                  className={clasesInput}
                />

                {errors.destino && (
                  <p className="mt-1 text-xs font-bold text-red-600">
                    {errors.destino}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <CalendarDays size={12} />
                    Salida
                  </label>

                  <input
                    type="date"
                    value={form.fechaInicio}
                    onChange={(event) =>
                      actualizarCampo("fechaInicio", event.target.value)
                    }
                    className={clasesInput}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Retorno
                  </label>

                  <input
                    type="date"
                    min={form.fechaInicio}
                    value={form.fechaFin}
                    onChange={(event) =>
                      actualizarCampo("fechaFin", event.target.value)
                    }
                    className={clasesInput}
                  />

                  {errors.fechaFin && (
                    <p className="mt-1 text-xs font-bold text-red-600">
                      {errors.fechaFin}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-brand-50 p-3 text-xs font-bold text-brand-800">
                Duración: {dias} {dias === 1 ? "día" : "días"}
              </div>

              <h3 className="flex items-center gap-2 border-t border-slate-100 pt-4 text-sm font-black uppercase tracking-wider text-slate-700">
                <Users size={16} />
                Personal asignado
              </h3>

              <div className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
                {usuarios.map((usuario) => {
                  const seleccionado = form.usuariosIds.includes(
                    String(usuario.id),
                  );

                  return (
                    <label
                      key={usuario.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${
                        seleccionado
                          ? "border-brand-200 bg-brand-50"
                          : "border-transparent hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={seleccionado}
                        onChange={() => alternarUsuario(usuario.id)}
                        className="h-4 w-4 accent-brand-700"
                      />

                      <div>
                        <p className="text-sm font-black text-slate-800">
                          {usuario.nombre}
                        </p>

                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                          {usuario.rol}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>

              {errors.usuariosIds && (
                <p className="text-xs font-bold text-red-600">
                  {errors.usuariosIds}
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-5 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-700">
                <WalletCards size={16} />
                Presupuesto
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {VIATIC_CATEGORIES.map((categoria) => {
                  const clave = categoria.value.toLowerCase();

                  return (
                    <div key={categoria.value}>
                      <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                        {categoria.label}
                      </label>

                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                          $
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.presupuesto[clave]}
                          onChange={(event) =>
                            actualizarPresupuesto(clave, event.target.value)
                          }
                          className={`${clasesInput} pl-7`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                  Bolsa total autorizada
                </p>

                <p className="mt-2 text-3xl font-black text-emerald-950">
                  {new Intl.NumberFormat("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  }).format(presupuestoTotal)}
                </p>
              </div>
            </section>
          </div>
        </form>

        <footer className="flex flex-col gap-3 border-t border-slate-200 bg-white p-5 md:flex-row md:justify-between">
          <div className="flex flex-wrap gap-2">
            {editando && viaje.permisos?.eliminar && (
              <button
                type="button"
                onClick={eliminarViaje}
                disabled={guardando}
                className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-xs font-black uppercase tracking-wider text-red-700 hover:bg-red-100"
              >
                <Trash2 size={15} />
                Eliminar viaje
              </button>
            )}

            {editando && (
              <button
                type="button"
                onClick={eliminarComprobantes}
                disabled={guardando}
                className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-xs font-black uppercase tracking-wider text-amber-700 hover:bg-amber-100"
              >
                <Trash2 size={15} />
                Eliminar comprobantes
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-600"
            >
              Cancelar
            </button>

            <button
              type="submit"
              form="travel-form"
              disabled={guardando}
              className="flex items-center gap-2 rounded-xl bg-brand-700 px-6 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-brand-800 disabled:opacity-50"
            >
              <Save size={16} />

              {guardando ? "Guardando..." : "Guardar viaje"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
