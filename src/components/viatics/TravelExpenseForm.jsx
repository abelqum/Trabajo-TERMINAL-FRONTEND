"use client";

import { useState } from "react";

import { ImagePlus, Plus, Send, Trash2 } from "lucide-react";

import Swal from "sweetalert2";

import {
  crearFilaGasto,
  validarGastosViaje,
  VIATIC_CATEGORIES,
} from "@/validations/viaticSchema";

import { viaticsService } from "@/services/viaticsService";

export default function TravelExpenseForm({ viajeId, onSaved }) {
  const [gastos, setGastos] = useState([crearFilaGasto()]);

  const [errors, setErrors] = useState({});

  const [guardando, setGuardando] = useState(false);

  function actualizar(index, campo, valor) {
    setGastos((actual) =>
      actual.map((gasto, indice) =>
        indice === index
          ? {
              ...gasto,
              [campo]: valor,
            }
          : gasto,
      ),
    );

    setErrors((actual) => {
      const nuevos = {
        ...actual,
      };

      delete nuevos[`${index}.${campo}`];

      return nuevos;
    });
  }

  function seleccionarArchivo(index, archivo) {
    if (!archivo) {
      return;
    }

    if (!archivo.type.startsWith("image/")) {
      Swal.fire({
        icon: "warning",
        title: "Archivo no válido",
        text: "El comprobante debe ser una imagen.",
      });

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setGastos((actual) =>
        actual.map((gasto, indice) =>
          indice === index
            ? {
                ...gasto,
                archivo,
                preview: reader.result,
              }
            : gasto,
        ),
      );
    };

    reader.readAsDataURL(archivo);
  }

  function agregarFila() {
    setGastos((actual) => [...actual, crearFilaGasto()]);
  }

  function quitarFila(index) {
    setGastos((actual) => actual.filter((_, indice) => indice !== index));
  }

  async function guardarGastos() {
    const validacion = validarGastosViaje(gastos);

    if (!validacion.success) {
      setErrors(validacion.errors);

      return;
    }

    setGuardando(true);

    try {
      await viaticsService.registrarGastos(viajeId, validacion.data);

      await Swal.fire({
        icon: "success",
        title: "Gastos enviados a revisión",
        timer: 1500,
        showConfirmButton: false,
      });

      setGastos([crearFilaGasto()]);

      setErrors({});

      await onSaved();
    } catch (error) {
      console.error(error);

      await Swal.fire({
        icon: "error",

        title: "No se pudieron registrar los gastos",

        text: error.message || "Ocurrió un error al cargar los comprobantes.",
      });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="rounded-2xl border border-brand-200 bg-brand-50/50 p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-black text-slate-800">Registrar gastos</h3>

          <p className="mt-1 text-xs text-slate-500">
            Los gastos quedarán pendientes de revisión.
          </p>
        </div>

        <button
          type="button"
          onClick={agregarFila}
          className="flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-black text-brand-700 shadow-sm"
        >
          <Plus size={15} />
          Agregar
        </button>
      </div>

      <div className="space-y-4">
        {gastos.map((gasto, index) => (
          <div
            key={gasto.idTemporal}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[100px_1fr_1fr]">
              <label className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
                {gasto.preview ? (
                  <img
                    src={gasto.preview}
                    alt="Vista previa del comprobante"
                    className="h-24 w-full object-cover"
                  />
                ) : (
                  <div className="py-5 text-center text-slate-400">
                    <ImagePlus size={24} className="mx-auto" />

                    <span className="mt-1 block text-[9px] font-black uppercase">
                      Ticket
                    </span>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) =>
                    seleccionarArchivo(index, event.target.files?.[0])
                  }
                />
              </label>

              <div className="space-y-3">
                <div>
                  <select
                    value={gasto.categoria}
                    onChange={(event) =>
                      actualizar(index, "categoria", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-bold outline-none focus:border-brand-700"
                  >
                    <option value="">Categoría</option>

                    {VIATIC_CATEGORIES.map((categoria) => (
                      <option key={categoria.value} value={categoria.value}>
                        {categoria.label}
                      </option>
                    ))}
                  </select>

                  {errors[`${index}.categoria`] && (
                    <p className="mt-1 text-[10px] font-bold text-red-600">
                      {errors[`${index}.categoria`]}
                    </p>
                  )}
                </div>

                <input
                  type="text"
                  value={gasto.descripcion}
                  onChange={(event) =>
                    actualizar(index, "descripcion", event.target.value)
                  }
                  placeholder="Descripción del pago"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-700"
                />

                {errors[`${index}.descripcion`] && (
                  <p className="text-[10px] font-bold text-red-600">
                    {errors[`${index}.descripcion`]}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={gasto.monto}
                  onChange={(event) =>
                    actualizar(index, "monto", event.target.value)
                  }
                  placeholder="Monto"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-bold outline-none focus:border-brand-700"
                />

                <input
                  type="date"
                  value={gasto.fecha}
                  onChange={(event) =>
                    actualizar(index, "fecha", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-bold outline-none focus:border-brand-700"
                />

                {gastos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => quitarFila(index)}
                    className="flex items-center gap-1 text-xs font-black text-red-600"
                  >
                    <Trash2 size={14} />
                    Quitar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          disabled={guardando}
          onClick={guardarGastos}
          className="flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-brand-800 disabled:opacity-50"
        >
          <Send size={15} />

          {guardando ? "Enviando..." : "Enviar a revisión"}
        </button>
      </div>
    </section>
  );
}
