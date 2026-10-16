"use client";

import { useState } from "react";

import {
  Image as ImageIcon,
  MinusCircle,
  PlusCircle,
  QrCode,
  X,
} from "lucide-react";

import Swal from "sweetalert2";

import { inventoryService } from "@/services/inventoryService";

export default function StockAdjustmentModal({
  producto,
  qrDataUrl,
  onClose,
  onUpdated,
}) {
  const [cantidad, setCantidad] = useState("1");

  const [motivo, setMotivo] = useState("");

  const [procesando, setProcesando] = useState(false);

  async function ajustar(tipo) {
    const valor = Number(cantidad);

    if (!Number.isInteger(valor) || valor <= 0) {
      await Swal.fire({
        icon: "warning",
        title: "Cantidad inválida",
        text: "Ingresa una cantidad entera mayor que cero.",
      });

      return;
    }

    if (tipo === "SALIDA" && valor > producto.cantidad) {
      await Swal.fire({
        icon: "warning",
        title: "Stock insuficiente",
        text: "No puedes retirar más unidades de las disponibles.",
      });

      return;
    }

    setProcesando(true);

    try {
      await inventoryService.ajustarStock(producto.id, {
        tipo,
        cantidad: valor,

        motivo: motivo.trim() || null,
      });

      await Swal.fire({
        icon: "success",

        title: "Inventario actualizado",

        timer: 1200,
        showConfirmButton: false,
      });

      onUpdated();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo actualizar el stock",
        text: error.message,
      });
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="grid max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl md:grid-cols-5">
        <section className="flex flex-col items-center justify-center border-b border-slate-200 bg-slate-50 p-6 md:col-span-2 md:border-b-0 md:border-r">
          <div className="flex aspect-square w-44 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {producto.fotoUrl ? (
              <img
                src={producto.fotoUrl}
                alt={producto.descripcion}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon size={45} className="text-slate-300" />
            )}
          </div>

          <div className="mt-5 flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Código QR"
                className="h-full w-full object-contain"
              />
            ) : (
              <QrCode className="text-slate-300" />
            )}
          </div>
        </section>

        <section className="relative p-6 md:col-span-3">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={19} />
          </button>

          <h2 className="max-w-[85%] text-xl font-black text-slate-800">
            {producto.descripcion}
          </h2>

          <p className="mt-1 text-xs font-semibold text-slate-500">
            {producto.modelo || "Sin modelo"}
          </p>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Stock actual
            </p>

            <p className="mt-2 text-5xl font-black text-brand-700">
              {producto.cantidad}
            </p>
          </div>

          <div className="mt-5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Cantidad
            </label>

            <input
              type="number"
              min="1"
              step="1"
              value={cantidad}
              onChange={(event) => setCantidad(event.target.value)}
              className="mt-2 w-full rounded-2xl border-2 border-slate-200 p-4 text-center text-3xl font-black text-slate-800 outline-none focus:border-brand-700"
            />
          </div>

          <div className="mt-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Motivo / referencia
            </label>

            <input
              type="text"
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              placeholder="Ej. Compra proveedor, salida para instalación..."
              className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-brand-700"
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={procesando}
              onClick={() => ajustar("SALIDA")}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-600 py-4 text-sm font-black text-white disabled:opacity-50"
            >
              <MinusCircle size={19} />
              Sacar
            </button>

            <button
              type="button"
              disabled={procesando}
              onClick={() => ajustar("ENTRADA")}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 text-sm font-black text-white disabled:opacity-50"
            >
              <PlusCircle size={19} />
              Agregar
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
