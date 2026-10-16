"use client";

import { useState } from "react";

import { Building2, Contact, Mail, Phone, Save, Users, X } from "lucide-react";

import Swal from "sweetalert2";

import { ApiError } from "@/lib/api/apiClient";

import { clientsService } from "@/services/clientsService";

import { parseClientForm } from "@/validations/clientSchema";

function crearEstadoInicial(cliente) {
  if (!cliente) {
    return {
      razonSocial: "",
      rfc: "",
      telefonos: "",
      correos: "",
    };
  }

  return {
    razonSocial: cliente.razonSocial ?? "",

    rfc: cliente.rfc ?? "",

    telefonos: Array.isArray(cliente.telefonos)
      ? cliente.telefonos.join(", ")
      : "",

    correos: Array.isArray(cliente.correos) ? cliente.correos.join(", ") : "",
  };
}

export default function ClientFormModal({ cliente = null, onClose, onSaved }) {
  const [formData, setFormData] = useState(() => crearEstadoInicial(cliente));

  const [errors, setErrors] = useState({});

  const [guardando, setGuardando] = useState(false);

  const editando = Boolean(cliente?.id);

  function actualizarCampo(campo, valor) {
    setFormData((actual) => ({
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

  async function handleSubmit(event) {
    event.preventDefault();

    const validacion = parseClientForm(formData);

    if (!validacion.success) {
      setErrors(validacion.errors);

      return;
    }

    setGuardando(true);

    try {
      if (editando) {
        await clientsService.actualizarCliente(cliente.id, validacion.data);
      } else {
        await clientsService.crearCliente(validacion.data);
      }

      await Swal.fire({
        icon: "success",
        title: editando ? "Cliente actualizado" : "Cliente registrado",
        timer: 1500,
        showConfirmButton: false,
      });

      onSaved();
    } catch (error) {
      console.error("Error guardando cliente:", error);

      let titulo = "No se pudo guardar el cliente";

      let mensaje = error.message || "Ocurrió un error inesperado.";

      if (error instanceof ApiError && error.status === 409) {
        titulo = "RFC duplicado";

        mensaje = "Ya existe un cliente registrado con ese RFC.";
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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800">
            <span className="rounded-lg bg-brand-50 p-2 text-brand-700">
              <Users size={20} />
            </span>

            {editando ? "Editar Cliente" : "Nuevo Cliente"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            aria-label="Cerrar"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form
          id="client-form"
          onSubmit={handleSubmit}
          className="space-y-6 overflow-y-auto p-6"
        >
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
              <Building2 size={16} className="text-slate-400" />
              Datos fiscales
            </h3>

            <div className="grid grid-cols-1 gap-5">
              <div>
                <label
                  htmlFor="razonSocial"
                  className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600"
                >
                  Razón Social *
                </label>

                <input
                  id="razonSocial"
                  type="text"
                  value={formData.razonSocial}
                  onChange={(event) =>
                    actualizarCampo("razonSocial", event.target.value)
                  }
                  disabled={guardando}
                  placeholder="Ej. Empresa Comercializadora S.A. de C.V."
                  className={`w-full rounded-lg border bg-slate-50 p-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:ring-1 ${
                    errors.razonSocial
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                      : "border-slate-300 focus:border-brand-700 focus:ring-brand-700"
                  }`}
                />

                {errors.razonSocial && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">
                    {errors.razonSocial}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="rfc"
                  className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600"
                >
                  RFC *
                </label>

                <input
                  id="rfc"
                  type="text"
                  value={formData.rfc}
                  onChange={(event) =>
                    actualizarCampo("rfc", event.target.value.toUpperCase())
                  }
                  disabled={guardando}
                  maxLength={13}
                  placeholder="Ej. ABC010101XX1"
                  className={`w-full rounded-lg border bg-slate-50 p-3 font-mono text-sm font-bold uppercase text-slate-800 outline-none transition-all focus:ring-1 ${
                    errors.rfc
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                      : "border-slate-300 focus:border-brand-700 focus:ring-brand-700"
                  }`}
                />

                {errors.rfc && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">
                    {errors.rfc}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
              <Contact size={16} className="text-slate-400" />
              Contacto
            </h3>

            <div className="grid grid-cols-1 gap-5">
              <div>
                <label
                  htmlFor="telefonos"
                  className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600"
                >
                  <Phone size={14} className="text-brand-600" />
                  Teléfonos
                </label>

                <input
                  id="telefonos"
                  type="text"
                  value={formData.telefonos}
                  onChange={(event) =>
                    actualizarCampo("telefonos", event.target.value)
                  }
                  disabled={guardando}
                  placeholder="5512345678, 5587654321"
                  className={`w-full rounded-lg border bg-slate-50 p-3 text-sm text-slate-800 outline-none transition-all focus:ring-1 ${
                    errors.telefonos
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                      : "border-slate-300 focus:border-brand-700 focus:ring-brand-700"
                  }`}
                />

                <p className="mt-1 text-[11px] text-slate-400">
                  Si existen varios, sepáralos por coma.
                </p>

                {errors.telefonos && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">
                    {errors.telefonos}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="correos"
                  className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600"
                >
                  <Mail size={14} className="text-brand-600" />
                  Correos electrónicos
                </label>

                <input
                  id="correos"
                  type="text"
                  value={formData.correos}
                  onChange={(event) =>
                    actualizarCampo("correos", event.target.value)
                  }
                  disabled={guardando}
                  placeholder="contacto@empresa.com, pagos@empresa.com"
                  className={`w-full rounded-lg border bg-slate-50 p-3 text-sm text-slate-800 outline-none transition-all focus:ring-1 ${
                    errors.correos
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                      : "border-slate-300 focus:border-brand-700 focus:ring-brand-700"
                  }`}
                />

                <p className="mt-1 text-[11px] text-slate-400">
                  Si existen varios, sepáralos por coma.
                </p>

                {errors.correos && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">
                    {errors.correos}
                  </p>
                )}
              </div>
            </div>
          </section>
        </form>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 p-6">
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="rounded-xl px-6 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-200/60 hover:text-slate-800 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="client-form"
            disabled={guardando}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-brand-700/20 transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Save size={17} />
            )}

            {guardando
              ? "Guardando..."
              : editando
                ? "Actualizar Cliente"
                : "Guardar Cliente"}
          </button>
        </div>
      </div>
    </div>
  );
}
