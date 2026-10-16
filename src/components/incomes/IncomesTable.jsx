"use client";

import { Edit2, ReceiptText, Trash2 } from "lucide-react";

function formatearMoneda(valor) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(valor ?? 0));
}

function formatearFecha(valor) {
  if (!valor) {
    return "—";
  }

  const fecha = new Date(`${valor}T12:00:00`);

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(fecha);
}

function obtenerEstado(estado) {
  const estados = {
    PAGADO: {
      texto: "Pagado",
      clase: "bg-emerald-100 text-emerald-700",
    },

    PENDIENTE: {
      texto: "Pendiente",
      clase: "bg-amber-100 text-amber-700",
    },

    CANCELADO: {
      texto: "Cancelado",
      clase: "bg-red-100 text-red-700",
    },
  };

  return (
    estados[estado] ?? {
      texto: estado,
      clase: "bg-slate-100 text-slate-600",
    }
  );
}

function obtenerFormaPago(valor) {
  const formas = {
    TRANSFERENCIA: "Transferencia",
    EFECTIVO: "Efectivo",
    TARJETA: "Tarjeta",
    CHEQUE: "Cheque",
    OTRO: "Otro",
  };

  return formas[valor] ?? "—";
}

export default function IncomesTable({
  ingresos,
  cargando,
  onEditar,
  onEliminar,
}) {
  if (cargando) {
    return (
      <div className="flex min-h-[430px] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-700 border-t-transparent" />

        <p className="text-sm font-bold text-slate-500">Cargando ingresos...</p>
      </div>
    );
  }

  if (!ingresos.length) {
    return (
      <div className="flex min-h-[430px] items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <ReceiptText size={28} />
          </div>

          <h3 className="mt-4 font-black text-slate-700">
            No se encontraron ingresos
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            No existen registros que coincidan con los filtros.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1250px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
          <tr>
            <th className="p-4">Cliente</th>

            <th className="p-4">Registro</th>

            <th className="p-4">Fecha</th>

            <th className="p-4 text-right">Subtotal</th>

            <th className="p-4 text-right">IVA</th>

            <th className="p-4 text-right">Total</th>

            <th className="p-4">Estado</th>

            <th className="p-4">Pago</th>

            <th className="p-4 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {ingresos.map((ingreso) => {
            const estado = obtenerEstado(ingreso.estado);

            return (
              <tr key={ingreso.id} className="transition hover:bg-slate-50">
                <td className="p-4">
                  <p className="max-w-[230px] truncate font-black text-slate-800">
                    {ingreso.cliente.razonSocial}
                  </p>

                  <p className="mt-1 font-mono text-[10px] font-bold text-slate-400">
                    {ingreso.cliente.rfc || "Sin RFC"}
                  </p>
                </td>

                <td className="p-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${
                      ingreso.tipoRegistro === "FACTURA"
                        ? "bg-brand-100 text-brand-700"
                        : "bg-violet-100 text-violet-700"
                    }`}
                  >
                    {ingreso.tipoRegistro === "FACTURA" ? "Factura" : "Ingreso"}
                  </span>

                  {ingreso.folio && (
                    <p className="mt-2 font-mono text-xs font-black text-slate-700">
                      {ingreso.folio}
                    </p>
                  )}

                  {ingreso.concepto && (
                    <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                      {ingreso.concepto}
                    </p>
                  )}
                </td>

                <td className="p-4 font-semibold text-slate-600">
                  {formatearFecha(ingreso.fecha)}
                </td>

                <td className="p-4 text-right font-semibold text-slate-600">
                  {formatearMoneda(ingreso.subtotal)}
                </td>

                <td className="p-4 text-right font-semibold text-slate-500">
                  {formatearMoneda(ingreso.iva)}
                </td>

                <td
                  className={`p-4 text-right font-black ${
                    ingreso.estado === "CANCELADO"
                      ? "text-slate-400 line-through"
                      : "text-slate-800"
                  }`}
                >
                  {formatearMoneda(ingreso.total)}
                </td>

                <td className="p-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${estado.clase}`}
                  >
                    {estado.texto}
                  </span>
                </td>

                <td className="p-4">
                  {ingreso.estado === "PAGADO" ? (
                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        {obtenerFormaPago(ingreso.formaPago)}
                      </p>

                      <p className="mt-1 text-[10px] font-semibold text-slate-400">
                        {formatearFecha(ingreso.fechaPago)}
                      </p>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>

                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEditar(ingreso)}
                      title="Editar ingreso"
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-brand-50 hover:text-brand-700"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEliminar(ingreso)}
                      title="Eliminar ingreso"
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
