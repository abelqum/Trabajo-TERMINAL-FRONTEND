"use client";

import { useState } from "react";

import { CheckCircle2, FileText, Image, MapPin, Trash2, X } from "lucide-react";

import Swal from "sweetalert2";

import TravelExpenseForm from "./TravelExpenseForm";

import {
  obtenerNombreCategoriaViatico,
  VIATIC_CATEGORIES,
} from "@/validations/viaticSchema";

import { viaticsService } from "@/services/viaticsService";

import { generarLiquidacionViatico } from "@/lib/reports/viaticsReport";

function moneda(valor) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(valor ?? 0));
}

function fecha(valor) {
  if (!valor) {
    return "—";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
  }).format(new Date(`${valor}T12:00:00`));
}

export default function TravelDetailModal({
  viajeInicial,
  onClose,
  onChanged,
}) {
  const [viaje, setViaje] = useState(viajeInicial);

  const [procesando, setProcesando] = useState(false);

  async function recargar() {
    const actualizado = await viaticsService.obtenerViaje(viaje.id);

    setViaje(actualizado);

    onChanged();
  }

  async function revisarGasto(gasto, estatus) {
    let motivoRechazo = null;

    if (estatus === "RECHAZADO") {
      const resultado = await Swal.fire({
        title: "Rechazar gasto",
        input: "textarea",
        inputLabel: "Motivo del rechazo",
        inputPlaceholder: "Explica por qué se rechaza...",
        showCancelButton: true,
        confirmButtonText: "Rechazar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#dc2626",
        inputValidator: (value) => {
          if (!value?.trim()) {
            return "Indica el motivo del rechazo.";
          }
        },
      });

      if (!resultado.isConfirmed) {
        return;
      }

      motivoRechazo = resultado.value.trim();
    }

    setProcesando(true);

    try {
      await viaticsService.cambiarEstadoGasto(viaje.id, gasto.id, {
        estatus,
        motivoRechazo,
      });

      await recargar();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo actualizar el gasto",
        text: error.message,
      });
    } finally {
      setProcesando(false);
    }
  }

  async function eliminarGasto(gasto) {
    const resultado = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar comprobante?",
      text: "Se eliminará el gasto y su archivo asociado.",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
    });

    if (!resultado.isConfirmed) {
      return;
    }

    setProcesando(true);

    try {
      await viaticsService.eliminarGasto(viaje.id, gasto.id);

      await recargar();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo eliminar",
        text: error.message,
      });
    } finally {
      setProcesando(false);
    }
  }

  async function finalizar() {
    if (viaje.resumen.gastosPendientes > 0) {
      await Swal.fire({
        icon: "warning",
        title: "Hay gastos pendientes",
        text: "Todos los gastos deben estar aprobados o rechazados antes de finalizar.",
      });

      return;
    }

    const resultado = await Swal.fire({
      icon: "question",
      title: "¿Finalizar viaje?",
      text: "Se cerrarán las cuentas y ya no podrán registrarse nuevos gastos.",
      showCancelButton: true,
      confirmButtonText: "Finalizar viaje",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#059669",
    });

    if (!resultado.isConfirmed) {
      return;
    }

    setProcesando(true);

    try {
      await viaticsService.finalizarViaje(viaje.id);

      await recargar();

      await Swal.fire({
        icon: "success",
        title: "Viaje finalizado",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo finalizar",
        text: error.message,
      });
    } finally {
      setProcesando(false);
    }
  }

  const gastosAprobados = viaje.gastos.filter(
    (gasto) => gasto.estatus === "APROBADO",
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-2xl">
        <header className="flex shrink-0 items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black text-slate-800">
                {viaje.nombre}
              </h2>

              <span
                className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${
                  viaje.estatus === "FINALIZADO"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-brand-100 text-brand-700"
                }`}
              >
                {viaje.estatus}
              </span>
            </div>

            <p className="mt-1 flex items-center gap-1 text-xs font-bold text-slate-500">
              <MapPin size={13} />

              {viaje.destino}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </header>

        <main className="flex-1 space-y-6 overflow-y-auto p-6">
          <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-brand-50 p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-brand-600">
                Fondo autorizado
              </p>

              <p className="mt-1 text-xl font-black text-brand-950">
                {moneda(viaje.presupuesto.total)}
              </p>
            </div>

            <div className="rounded-2xl bg-violet-50 p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-violet-600">
                Gastado aprobado
              </p>

              <p className="mt-1 text-xl font-black text-violet-950">
                {moneda(viaje.resumen.gastadoAprobado)}
              </p>
            </div>

            <div
              className={`rounded-2xl p-4 ${
                viaje.resumen.saldo >= 0 ? "bg-emerald-50" : "bg-red-50"
              }`}
            >
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                Saldo
              </p>

              <p className="mt-1 text-xl font-black text-slate-900">
                {moneda(viaje.resumen.saldo)}
              </p>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-slate-700">
              Presupuesto por categoría
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {VIATIC_CATEGORIES.map((categoria) => {
                const clave = categoria.value.toLowerCase();

                const presupuesto = Number(viaje.presupuesto[clave] ?? 0);

                const gastado = gastosAprobados
                  .filter((gasto) => gasto.categoria === categoria.value)
                  .reduce((total, gasto) => total + gasto.monto, 0);

                const disponible = presupuesto - gastado;

                const porcentaje =
                  presupuesto > 0
                    ? Math.min((gastado / presupuesto) * 100, 100)
                    : 0;

                return (
                  <article
                    key={categoria.value}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="text-xs font-black text-slate-800">
                          {categoria.label}
                        </p>

                        <p className="mt-1 text-[10px] font-semibold text-slate-400">
                          {moneda(gastado)} / {moneda(presupuesto)}
                        </p>
                      </div>

                      <p
                        className={`text-xs font-black ${
                          disponible >= 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {moneda(disponible)}
                      </p>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          disponible >= 0 ? "bg-brand-600" : "bg-red-600"
                        }`}
                        style={{
                          width: `${porcentaje}%`,
                        }}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {viaje.estatus === "ACTIVO" && viaje.permisos.registrarGastos && (
            <TravelExpenseForm viajeId={viaje.id} onSaved={recargar} />
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-slate-700">
              Gastos registrados
            </h3>

            {!viaje.gastos.length ? (
              <p className="py-8 text-center text-sm font-bold text-slate-400">
                No hay gastos registrados.
              </p>
            ) : (
              <div className="space-y-3">
                {viaje.gastos.map((gasto) => (
                  <article
                    key={gasto.id}
                    className={`rounded-2xl border p-4 ${
                      gasto.estatus === "RECHAZADO"
                        ? "border-red-200 bg-red-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div className="flex min-w-0 items-center gap-3">
                        {gasto.comprobanteUrl ? (
                          <a
                            href={gasto.comprobanteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white"
                          >
                            <img
                              src={gasto.comprobanteUrl}
                              alt="Comprobante"
                              className="h-full w-full object-cover"
                            />
                          </a>
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-400">
                            <Image size={20} />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded bg-slate-200 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-slate-600">
                              {obtenerNombreCategoriaViatico(gasto.categoria)}
                            </span>

                            <span
                              className={`rounded px-2 py-1 text-[9px] font-black uppercase ${
                                gasto.estatus === "APROBADO"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : gasto.estatus === "RECHAZADO"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {gasto.estatus}
                            </span>
                          </div>

                          <p className="mt-2 truncate text-sm font-black text-slate-800">
                            {gasto.descripcion}
                          </p>

                          <p className="mt-1 text-[10px] font-semibold text-slate-400">
                            {fecha(gasto.fecha)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 md:justify-end">
                        <p
                          className={`text-lg font-black ${
                            gasto.estatus === "RECHAZADO"
                              ? "text-slate-400 line-through"
                              : "text-slate-800"
                          }`}
                        >
                          {moneda(gasto.monto)}
                        </p>

                        {viaje.permisos.revisarGastos &&
                          gasto.estatus === "PENDIENTE" && (
                            <>
                              <button
                                type="button"
                                disabled={procesando}
                                onClick={() => revisarGasto(gasto, "APROBADO")}
                                className="rounded-xl bg-emerald-100 p-2 text-emerald-700 hover:bg-emerald-600 hover:text-white"
                              >
                                <CheckCircle2 size={16} />
                              </button>

                              <button
                                type="button"
                                disabled={procesando}
                                onClick={() => revisarGasto(gasto, "RECHAZADO")}
                                className="rounded-xl bg-red-100 p-2 text-red-700 hover:bg-red-600 hover:text-white"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}

                        {gasto.puedeEliminar &&
                          viaje.estatus !== "FINALIZADO" && (
                            <button
                              type="button"
                              disabled={procesando}
                              onClick={() => eliminarGasto(gasto)}
                              className="rounded-xl p-2 text-red-500 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                      </div>
                    </div>

                    {gasto.estatus === "RECHAZADO" && (
                      <div className="mt-3 rounded-xl border border-red-200 bg-white p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-red-500">
                          Motivo del rechazo
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-600">
                          {gasto.motivoRechazo || "No especificado"}
                        </p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>

        <footer className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-slate-200 bg-white px-6 py-5">
          {viaje.estatus === "FINALIZADO" && (
            <button
              type="button"
              onClick={() => generarLiquidacionViatico(viaje)}
              className="flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-700"
            >
              <FileText size={16} />
              Liquidación PDF
            </button>
          )}

          {viaje.estatus === "ACTIVO" && viaje.permisos.finalizar && (
            <button
              type="button"
              disabled={procesando}
              onClick={finalizar}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              Finalizar viaje
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
