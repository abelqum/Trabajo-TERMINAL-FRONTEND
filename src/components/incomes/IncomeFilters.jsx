"use client";

import { useState } from "react";

import { Filter, RotateCcw, Search } from "lucide-react";

export const DEFAULT_INCOME_FILTERS = {
  search: "",
  clienteId: "",
  tipoRegistro: "",
  estado: "",
  fechaDesde: "",
  fechaHasta: "",
  fechaReferencia: "REGISTRO",
};

export default function IncomeFilters({ clientes, onAplicar }) {
  const [filtros, setFiltros] = useState(DEFAULT_INCOME_FILTERS);

  function actualizarCampo(campo, valor) {
    setFiltros((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  function aplicarFiltros(event) {
    event.preventDefault();

    onAplicar({
      ...filtros,
      search: filtros.search.trim(),
    });
  }

  function limpiarFiltros() {
    const filtrosLimpios = {
      ...DEFAULT_INCOME_FILTERS,
    };

    setFiltros(filtrosLimpios);

    onAplicar(filtrosLimpios);
  }

  return (
    <form
      onSubmit={aplicarFiltros}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center gap-2">
        <Filter size={17} className="text-brand-700" />

        <h2 className="text-sm font-black text-slate-800">Filtros</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="xl:col-span-2">
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
            Buscar
          </label>

          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={filtros.search}
              onChange={(event) =>
                actualizarCampo("search", event.target.value)
              }
              placeholder="Cliente, RFC, folio o concepto..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
            Cliente
          </label>

          <select
            value={filtros.clienteId}
            onChange={(event) =>
              actualizarCampo("clienteId", event.target.value)
            }
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10"
          >
            <option value="">Todos</option>

            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.razonSocial}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
            Tipo
          </label>

          <select
            value={filtros.tipoRegistro}
            onChange={(event) =>
              actualizarCampo("tipoRegistro", event.target.value)
            }
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10"
          >
            <option value="">Todos</option>

            <option value="FACTURA">Factura</option>

            <option value="INGRESO">Ingreso</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
            Estado
          </label>

          <select
            value={filtros.estado}
            onChange={(event) => actualizarCampo("estado", event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10"
          >
            <option value="">Todos</option>

            <option value="PENDIENTE">Pendiente</option>

            <option value="PAGADO">Pagado</option>

            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
            Fecha a consultar
          </label>

          <select
            value={filtros.fechaReferencia}
            onChange={(event) =>
              actualizarCampo("fechaReferencia", event.target.value)
            }
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10"
          >
            <option value="REGISTRO">Fecha del registro</option>

            <option value="PAGO">Fecha de pago</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
            Desde
          </label>

          <input
            type="date"
            value={filtros.fechaDesde}
            onChange={(event) =>
              actualizarCampo("fechaDesde", event.target.value)
            }
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
            Hasta
          </label>

          <input
            type="date"
            value={filtros.fechaHasta}
            onChange={(event) =>
              actualizarCampo("fechaHasta", event.target.value)
            }
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col justify-end gap-2 border-t border-slate-100 pt-4 sm:flex-row">
        <button
          type="button"
          onClick={limpiarFiltros}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-600 transition hover:bg-slate-100"
        >
          <RotateCcw size={15} />
          Limpiar
        </button>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-brand-800"
        >
          <Search size={15} />
          Aplicar filtros
        </button>
      </div>
    </form>
  );
}
