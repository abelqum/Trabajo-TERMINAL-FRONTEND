"use client";

import { Edit2, Mail, Phone, ShieldCheck, Trash2, Users } from "lucide-react";

export default function ClientsTable({
  clientes,
  cargando,
  onEditar,
  onEliminar,
}) {
  if (cargando) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-700 border-t-transparent" />

        <p className="text-sm font-bold text-slate-500">Cargando clientes...</p>
      </div>
    );
  }

  if (!clientes.length) {
    return (
      <div className="flex min-h-[420px] items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Users size={28} />
          </div>

          <h3 className="mt-4 font-black text-slate-700">
            No se encontraron clientes
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            No existen registros que coincidan con la búsqueda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full whitespace-nowrap text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="w-1/4 p-4">Razón Social</th>

            <th className="p-4">RFC</th>

            <th className="p-4">Correos</th>

            <th className="p-4">Teléfonos</th>

            <th className="p-4 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {clientes.map((cliente) => (
            <tr
              key={cliente.id}
              className="transition-colors hover:bg-slate-50"
            >
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="shrink-0 rounded-lg bg-emerald-50 p-2 text-emerald-600">
                    <ShieldCheck size={18} />
                  </div>

                  <span
                    className="max-w-[220px] truncate font-black text-slate-800"
                    title={cliente.razonSocial}
                  >
                    {cliente.razonSocial}
                  </span>
                </div>
              </td>

              <td className="p-4 font-mono font-bold tracking-wider text-slate-600">
                {cliente.rfc || "—"}
              </td>

              <td className="p-4">
                {cliente.correos.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {cliente.correos.map((correo, index) => (
                      <span
                        key={`${cliente.id}-correo-${index}`}
                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-600"
                      >
                        <Mail size={12} className="text-slate-400" />

                        {correo}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs italic text-slate-400">
                    Sin correo
                  </span>
                )}
              </td>

              <td className="p-4">
                {cliente.telefonos.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {cliente.telefonos.map((telefono, index) => (
                      <span
                        key={`${cliente.id}-telefono-${index}`}
                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-600"
                      >
                        <Phone size={12} className="text-slate-400" />

                        {telefono}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs italic text-slate-400">
                    Sin teléfono
                  </span>
                )}
              </td>

              <td className="p-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEditar(cliente)}
                    title="Editar cliente"
                    aria-label={`Editar ${cliente.razonSocial}`}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onEliminar(cliente)}
                    title="Eliminar cliente"
                    aria-label={`Eliminar ${cliente.razonSocial}`}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
