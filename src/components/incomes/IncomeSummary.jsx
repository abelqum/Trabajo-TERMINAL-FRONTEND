"use client";

import { Ban, CircleDollarSign, Clock3, ReceiptText } from "lucide-react";

function formatearMoneda(valor) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(valor ?? 0));
}

export default function IncomeSummary({ resumen }) {
  const tarjetas = [
    {
      titulo: "Cobrado",
      valor: formatearMoneda(resumen.totalCobrado),
      detalle: `${resumen.cantidadPagados} pagados`,
      icono: CircleDollarSign,
      clases: "border-emerald-100 bg-emerald-50 text-emerald-700",
    },
    {
      titulo: "Pendiente por cobrar",
      valor: formatearMoneda(resumen.totalPendiente),
      detalle: `${resumen.cantidadPendientes} pendientes`,
      icono: Clock3,
      clases: "border-amber-100 bg-amber-50 text-amber-700",
    },
    {
      titulo: "Cancelado",
      valor: formatearMoneda(resumen.totalCancelado),
      detalle: `${resumen.cantidadCancelados} cancelados`,
      icono: Ban,
      clases: "border-red-100 bg-red-50 text-red-700",
    },
    {
      titulo: "Registros",
      valor: resumen.cantidadRegistros,
      detalle: "Ingresos encontrados",
      icono: ReceiptText,
      clases: "border-brand-100 bg-brand-50 text-brand-700",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {tarjetas.map(({ titulo, valor, detalle, icono: Icono, clases }) => (
        <article key={titulo} className={`rounded-2xl border p-5 ${clases}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
                {titulo}
              </p>

              <p className="mt-2 text-2xl font-black">{valor}</p>

              <p className="mt-1 text-xs font-semibold opacity-70">{detalle}</p>
            </div>

            <div className="rounded-xl bg-white/70 p-2.5">
              <Icono size={20} />
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
