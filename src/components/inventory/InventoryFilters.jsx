"use client";

import { useState } from "react";

import { Filter, RotateCcw, Search } from "lucide-react";

export const DEFAULT_INVENTORY_FILTERS = {
  search: "",
  marcaId: "",
  categoriaId: "",
  medidaId: "",
  almacenId: "",
  estatus: "",
};

export default function InventoryFilters({ catalogos, onAplicar }) {
  const [filtros, setFiltros] = useState(DEFAULT_INVENTORY_FILTERS);

  function cambiar(campo, valor) {
    setFiltros((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  function aplicar(event) {
    event.preventDefault();

    onAplicar({
      ...filtros,

      search: filtros.search.trim(),
    });
  }

  function limpiar() {
    setFiltros(DEFAULT_INVENTORY_FILTERS);

    onAplicar(DEFAULT_INVENTORY_FILTERS);
  }

  const selectClass =
    "min-w-[150px] flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-brand-700";

  return (
    <form
      onSubmit={aplicar}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          value={filtros.search}
          onChange={(event) => cambiar("search", event.target.value)}
          placeholder="Buscar por descripción o modelo..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-bold text-slate-800 outline-none focus:border-brand-700"
        />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
          <Filter size={15} />
          Filtros
        </div>

        <select
          value={filtros.marcaId}
          onChange={(event) => cambiar("marcaId", event.target.value)}
          className={selectClass}
        >
          <option value="">Todas las marcas</option>

          {catalogos.marcas?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nombre}
            </option>
          ))}
        </select>

        <select
          value={filtros.categoriaId}
          onChange={(event) => cambiar("categoriaId", event.target.value)}
          className={selectClass}
        >
          <option value="">Todas las categorías</option>

          {catalogos.categorias?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nombre}
            </option>
          ))}
        </select>

        <select
          value={filtros.medidaId}
          onChange={(event) => cambiar("medidaId", event.target.value)}
          className={selectClass}
        >
          <option value="">Cualquier medida</option>

          {catalogos.medidas?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nombre}
            </option>
          ))}
        </select>

        <select
          value={filtros.almacenId}
          onChange={(event) => cambiar("almacenId", event.target.value)}
          className={selectClass}
        >
          <option value="">Cualquier almacén</option>

          {catalogos.almacenes?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nombre}
            </option>
          ))}
        </select>

        <select
          value={filtros.estatus}
          onChange={(event) => cambiar("estatus", event.target.value)}
          className={selectClass}
        >
          <option value="">Todos los estatus</option>

          <option value="STOCK_BAJO">Stock bajo</option>

          <option value="SUFICIENTE">Stock suficiente</option>
        </select>

        <button
          type="button"
          onClick={limpiar}
          className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-black text-slate-600"
        >
          <RotateCcw size={15} />
          Limpiar
        </button>

        <button
          type="submit"
          className="rounded-xl bg-brand-700 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white"
        >
          Aplicar
        </button>
      </div>
    </form>
  );
}
