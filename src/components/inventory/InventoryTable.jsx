"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Edit2,
  ExternalLink,
  Image as ImageIcon,
  PackageMinus,
  PackagePlus,
  Trash2,
  Wrench,
} from "lucide-react";

function moneda(valor) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(valor ?? 0));
}

export default function InventoryTable({
  productos,
  cargando,
  selectedIds,
  onSeleccionar,
  onSeleccionarPagina,
  onAjustar,
  onEditar,
  onEliminar,
  onDuplicar,
  onArmar,
  onDesarmar,
}) {
  const todosSeleccionados =
    productos.length > 0 &&
    productos.every((producto) => selectedIds.includes(producto.id));

  if (cargando) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-700 border-t-transparent" />
      </div>
    );
  }

  if (!productos.length) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <p className="font-bold text-slate-400">No se encontraron productos.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1350px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
          <tr>
            <th className="p-4 text-center">
              <input
                type="checkbox"
                checked={todosSeleccionados}
                onChange={(event) =>
                  onSeleccionarPagina(event.target.checked, productos)
                }
                className="h-4 w-4 accent-brand-700"
              />
            </th>

            <th className="p-4">Producto / Kit</th>

            <th className="p-4">Categoría</th>

            <th className="p-4">Condición</th>

            <th className="p-4">Proveedor</th>

            <th className="p-4">Ubicación</th>

            <th className="p-4 text-right">Precio</th>

            <th className="p-4 text-center">Stock</th>

            <th className="p-4 text-center">Estatus</th>

            <th className="p-4 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {productos.map((producto) => {
            const stockBajo =
              !producto.esKit && producto.cantidad <= producto.stockMinimo;

            return (
              <tr
                key={producto.id}
                className={
                  producto.esKit
                    ? "bg-brand-50/20 hover:bg-brand-50/40"
                    : "hover:bg-slate-50"
                }
              >
                <td className="p-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(producto.id)}
                    onChange={() => onSeleccionar(producto.id)}
                    className="h-4 w-4 accent-brand-700"
                  />
                </td>

                <td className="p-4">
                  <button
                    type="button"
                    onClick={() => onAjustar(producto)}
                    className="flex items-center gap-3 text-left"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                      {producto.fotoUrl ? (
                        <img
                          src={producto.fotoUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : producto.esKit ? (
                        <Wrench size={18} className="text-brand-500" />
                      ) : (
                        <ImageIcon size={18} className="text-slate-300" />
                      )}
                    </div>

                    <div>
                      <p className="flex max-w-[260px] items-center gap-2 whitespace-normal font-black text-slate-800">
                        {producto.esKit && (
                          <span className="rounded bg-brand-600 px-1.5 py-0.5 text-[9px] font-black text-white">
                            KIT
                          </span>
                        )}

                        {producto.descripcion}
                      </p>

                      <p className="mt-1 text-[10px] font-semibold text-slate-500">
                        {producto.medida?.nombre && (
                          <>{producto.medida.nombre} · </>
                        )}

                        {producto.modelo || "Sin modelo"}

                        {producto.marca?.nombre &&
                          ` · ${producto.marca.nombre}`}
                      </p>
                    </div>
                  </button>
                </td>

                <td className="p-4">
                  {producto.categoria?.nombre || "Sin asignar"}
                </td>

                <td className="p-4">{producto.condicion?.nombre || "N/A"}</td>

                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span>{producto.proveedor?.nombre || "Sin proveedor"}</span>

                    {producto.proveedor?.enlace && (
                      <a
                        href={producto.proveedor.enlace}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-brand-50 p-2 text-brand-700"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </td>

                <td className="p-4">
                  <p className="font-bold text-slate-700">
                    {producto.almacen?.nombre ||
                      (producto.esKit ? "Zona de kits" : "N/A")}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Fila: {producto.fila || "N/A"}
                  </p>
                </td>

                <td className="p-4 text-right font-black text-slate-700">
                  {moneda(producto.precioUnitario)}
                </td>

                <td className="p-4 text-center">
                  <button
                    type="button"
                    onClick={() => onAjustar(producto)}
                    className={`text-lg font-black ${
                      producto.esKit
                        ? "text-brand-700"
                        : stockBajo
                          ? "text-red-600"
                          : "text-brand-700"
                    }`}
                  >
                    {producto.cantidad}
                  </button>
                </td>

                <td className="p-4 text-center">
                  {producto.esKit ? (
                    <span className="rounded bg-brand-100 px-2 py-1 text-[9px] font-black uppercase text-brand-700">
                      Ensamblaje
                    </span>
                  ) : stockBajo ? (
                    <span className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-1 text-[9px] font-black uppercase text-red-700">
                      <AlertTriangle size={11} />
                      Comprar
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-1 text-[9px] font-black uppercase text-emerald-700">
                      <CheckCircle2 size={11} />
                      Suficiente
                    </span>
                  )}
                </td>

                <td className="p-4">
                  <div className="flex justify-center gap-1">
                    {producto.esKit ? (
                      <>
                        {producto.permisos.armarKit && (
                          <button
                            type="button"
                            onClick={() => onArmar(producto)}
                            title="Armar kit"
                            className="rounded-lg bg-emerald-50 p-2 text-emerald-700"
                          >
                            <PackagePlus size={16} />
                          </button>
                        )}

                        {producto.permisos.desarmarKit && (
                          <button
                            type="button"
                            onClick={() => onDesarmar(producto)}
                            title="Desarmar kit"
                            className="rounded-lg bg-orange-50 p-2 text-orange-700"
                          >
                            <PackageMinus size={16} />
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {producto.permisos.editar && (
                          <button
                            type="button"
                            onClick={() => onEditar(producto)}
                            className="rounded-lg bg-brand-50 p-2 text-brand-700"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}

                        {producto.permisos.duplicar && (
                          <button
                            type="button"
                            onClick={() => onDuplicar(producto)}
                            className="rounded-lg bg-slate-100 p-2 text-slate-600"
                          >
                            <Copy size={16} />
                          </button>
                        )}

                        {producto.permisos.eliminar && (
                          <button
                            type="button"
                            onClick={() => onEliminar(producto)}
                            className="rounded-lg bg-red-50 p-2 text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </>
                    )}
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
