"use client";

import { useState } from "react";

import {
  CalendarDays,
  CircleDollarSign,
  FileText,
  ReceiptText,
  Save,
  X,
} from "lucide-react";

import Swal from "sweetalert2";

import { ApiError } from "@/lib/api/apiClient";

import { incomesService } from "@/services/incomesService";

import {
  calcularImportes,
  crearEstadoInicialIngreso,
  INCOME_STATUSES,
  PAYMENT_METHODS,
  parseIncomeForm,
} from "@/validations/incomeSchema";

export default function IncomeFormModal({
  ingreso = null,
  clientes,
  onClose,
  onSaved,
}) {
  const [formData, setFormData] = useState(() =>
    crearEstadoInicialIngreso(ingreso),
  );

  const [errors, setErrors] = useState({});

  const [guardando, setGuardando] = useState(false);

  const editando = Boolean(ingreso?.id);

  const importes = calcularImportes(formData.total, formData.incluyeIva);

  function limpiarError(campo) {
    if (!errors[campo]) {
      return;
    }

    setErrors((actual) => {
      const nuevos = {
        ...actual,
      };

      delete nuevos[campo];

      return nuevos;
    });
  }

  function actualizarCampo(campo, valor) {
    setFormData((actual) => ({
      ...actual,
      [campo]: valor,
    }));

    limpiarError(campo);
  }

  function cambiarTipoRegistro(tipoRegistro) {
    setFormData((actual) => ({
      ...actual,

      tipoRegistro,

      folio: tipoRegistro === "INGRESO" ? "" : actual.folio,

      estado:
        tipoRegistro === "INGRESO"
          ? "PAGADO"
          : actual.tipoRegistro === "INGRESO"
            ? "PENDIENTE"
            : actual.estado,

      fechaPago:
        tipoRegistro === "INGRESO"
          ? actual.fechaPago || actual.fecha
          : actual.fechaPago,

      formaPago:
        tipoRegistro === "INGRESO" ? actual.formaPago : actual.formaPago,
    }));

    setErrors({});
  }

  function cambiarEstado(estado) {
    setFormData((actual) => ({
      ...actual,

      estado,

      fechaPago: estado === "PAGADO" ? actual.fechaPago || actual.fecha : "",

      formaPago: estado === "PAGADO" ? actual.formaPago : "",
    }));

    setErrors((actual) => {
      const nuevos = {
        ...actual,
      };

      delete nuevos.estado;
      delete nuevos.fechaPago;
      delete nuevos.formaPago;

      return nuevos;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validacion = parseIncomeForm(formData);

    if (!validacion.success) {
      setErrors(validacion.errors);

      return;
    }

    setGuardando(true);

    try {
      if (editando) {
        await incomesService.actualizarIngreso(ingreso.id, validacion.data);
      } else {
        await incomesService.crearIngreso(validacion.data);
      }

      await Swal.fire({
        icon: "success",

        title: editando ? "Ingreso actualizado" : "Ingreso registrado",

        timer: 1500,

        showConfirmButton: false,
      });

      onSaved();
    } catch (error) {
      console.error("Error guardando ingreso:", error);

      let titulo = "No se pudo guardar el ingreso";

      let mensaje = error.message || "Ocurrió un error inesperado.";

      if (error instanceof ApiError && error.status === 409) {
        titulo = "Registro duplicado";

        mensaje = "Ya existe un registro con los mismos datos o folio.";
      }

      await Swal.fire({
        icon: "error",
        title,
        text: mensaje,

        confirmButtonText: "Aceptar",

        confirmButtonColor: "#dc2626",
      });
    } finally {
      setGuardando(false);
    }
  }

  function claseInput(campo) {
    return `w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:ring-2 ${
      errors[campo]
        ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
        : "border-slate-300 focus:border-brand-700 focus:ring-brand-700/10"
    }`;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !guardando) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-brand-50 p-2.5 text-brand-700">
              <ReceiptText size={21} />
            </span>

            <div>
              <h2 className="text-xl font-black text-slate-800">
                {editando ? "Editar ingreso" : "Nuevo ingreso"}
              </h2>

              <p className="mt-0.5 text-xs font-medium text-slate-400">
                Registra una factura o un ingreso recibido.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            <X size={21} />
          </button>
        </header>

        <form
          id="income-form"
          onSubmit={handleSubmit}
          className="space-y-5 overflow-y-auto p-6"
        >
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-black text-slate-800">
              <FileText size={16} className="text-brand-700" />
              Información del registro
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Tipo de registro *
                </label>

                <select
                  value={formData.tipoRegistro}
                  onChange={(event) => cambiarTipoRegistro(event.target.value)}
                  disabled={guardando}
                  className={claseInput("tipoRegistro")}
                >
                  <option value="FACTURA">Factura</option>

                  <option value="INGRESO">Ingreso</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Cliente *
                </label>

                <select
                  value={formData.clienteId}
                  onChange={(event) =>
                    actualizarCampo("clienteId", event.target.value)
                  }
                  disabled={guardando}
                  className={claseInput("clienteId")}
                >
                  <option value="">Selecciona un cliente</option>

                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.razonSocial}
                    </option>
                  ))}
                </select>

                {errors.clienteId && (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    {errors.clienteId}
                  </p>
                )}
              </div>

              {formData.tipoRegistro === "FACTURA" && (
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Folio de factura *
                  </label>

                  <input
                    type="text"
                    value={formData.folio}
                    onChange={(event) =>
                      actualizarCampo("folio", event.target.value.toUpperCase())
                    }
                    disabled={guardando}
                    placeholder="Ej. FAC-2026-001"
                    className={claseInput("folio")}
                  />

                  {errors.folio && (
                    <p className="mt-1 text-xs font-semibold text-red-600">
                      {errors.folio}
                    </p>
                  )}
                </div>
              )}

              <div
                className={
                  formData.tipoRegistro === "INGRESO" ? "md:col-span-2" : ""
                }
              >
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Concepto {formData.tipoRegistro === "INGRESO" ? "*" : ""}
                </label>

                <input
                  type="text"
                  value={formData.concepto}
                  onChange={(event) =>
                    actualizarCampo("concepto", event.target.value)
                  }
                  disabled={guardando}
                  placeholder="Ej. Anticipo por servicio"
                  className={claseInput("concepto")}
                />

                {errors.concepto && (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    {errors.concepto}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <CalendarDays size={13} />
                  Fecha *
                </label>

                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(event) =>
                    actualizarCampo("fecha", event.target.value)
                  }
                  disabled={guardando}
                  className={claseInput("fecha")}
                />

                {errors.fecha && (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    {errors.fecha}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <CircleDollarSign size={13} />
                  Total *
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.total}
                  onChange={(event) =>
                    actualizarCampo("total", event.target.value)
                  }
                  disabled={guardando}
                  placeholder="0.00"
                  className={claseInput("total")}
                />

                {errors.total && (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    {errors.total}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  Desglose del importe
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  El cálculo definitivo se realizará en el servidor.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.incluyeIva}
                  onChange={(event) =>
                    actualizarCampo("incluyeIva", event.target.checked)
                  }
                  disabled={guardando}
                  className="h-4 w-4 accent-brand-700"
                />

                <span className="text-xs font-bold text-slate-700">
                  El total incluye IVA (16%)
                </span>
              </label>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Subtotal
                </p>

                <p className="mt-1 text-lg font-black text-slate-700">
                  $
                  {importes.subtotal.toLocaleString("es-MX", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  IVA
                </p>

                <p className="mt-1 text-lg font-black text-slate-700">
                  $
                  {importes.iva.toLocaleString("es-MX", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="rounded-xl bg-brand-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-brand-500">
                  Total
                </p>

                <p className="mt-1 text-lg font-black text-brand-900">
                  $
                  {importes.total.toLocaleString("es-MX", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-black text-slate-800">
              Estado y pago
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Estado *
                </label>

                <select
                  value={formData.estado}
                  onChange={(event) => cambiarEstado(event.target.value)}
                  disabled={guardando || formData.tipoRegistro === "INGRESO"}
                  className={claseInput("estado")}
                >
                  {INCOME_STATUSES.map((estado) => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
              </div>

              {formData.estado === "PAGADO" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Fecha de pago *
                    </label>

                    <input
                      type="date"
                      value={formData.fechaPago}
                      onChange={(event) =>
                        actualizarCampo("fechaPago", event.target.value)
                      }
                      disabled={guardando}
                      className={claseInput("fechaPago")}
                    />

                    {errors.fechaPago && (
                      <p className="mt-1 text-xs font-semibold text-red-600">
                        {errors.fechaPago}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Forma de pago *
                    </label>

                    <select
                      value={formData.formaPago}
                      onChange={(event) =>
                        actualizarCampo("formaPago", event.target.value)
                      }
                      disabled={guardando}
                      className={claseInput("formaPago")}
                    >
                      <option value="">Selecciona</option>

                      {PAYMENT_METHODS.map((forma) => (
                        <option key={forma.value} value={forma.value}>
                          {forma.label}
                        </option>
                      ))}
                    </select>

                    {errors.formaPago && (
                      <p className="mt-1 text-xs font-semibold text-red-600">
                        {errors.formaPago}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
              Comentarios
            </label>

            <textarea
              rows={3}
              value={formData.comentarios}
              onChange={(event) =>
                actualizarCampo("comentarios", event.target.value)
              }
              disabled={guardando}
              placeholder="Información adicional del registro..."
              className={claseInput("comentarios")}
            />

            {errors.comentarios && (
              <p className="mt-1 text-xs font-semibold text-red-600">
                {errors.comentarios}
              </p>
            )}
          </section>
        </form>

        <footer className="flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-white px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="rounded-xl px-5 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="income-form"
            disabled={guardando}
            className="flex items-center gap-2 rounded-xl bg-brand-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-700/20 transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Save size={17} />
            )}

            {guardando
              ? "Guardando..."
              : editando
                ? "Actualizar"
                : "Guardar ingreso"}
          </button>
        </footer>
      </div>
    </div>
  );
}
