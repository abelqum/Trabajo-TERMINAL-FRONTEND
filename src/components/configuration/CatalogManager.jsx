"use client";

import { useState } from "react";

import { Edit2, ExternalLink, Plus, Settings, Trash2, X } from "lucide-react";

import Swal from "sweetalert2";

import { configurationService } from "@/services/configurationService";

import {
  CONFIG_CATALOGS,
  parseCatalogForm,
} from "@/validations/configurationSchema";

export default function CatalogManager() {
  const [catalogoActivo, setCatalogoActivo] = useState(CONFIG_CATALOGS[0]);

  const [items, setItems] = useState([]);

  const [cargando, setCargando] = useState(false);

  const [cargadoInicial, setCargadoInicial] = useState(false);

  const [editando, setEditando] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    enlace: "",
    permiteActualizarPrecio: false,
  });

  const [errors, setErrors] = useState({});

  async function cargar(catalogo = catalogoActivo) {
    setCargando(true);

    try {
      const response = await configurationService.obtenerCatalogo(
        catalogo.value,
      );

      setItems(response);

      setCargadoInicial(true);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo cargar el catálogo",
        text: error.message,
      });
    } finally {
      setCargando(false);
    }
  }

  function limpiarFormulario() {
    setEditando(null);

    setForm({
      nombre: "",
      enlace: "",
      permiteActualizarPrecio: false,
    });

    setErrors({});
  }

  async function cambiarCatalogo(catalogo) {
    setCatalogoActivo(catalogo);

    limpiarFormulario();

    setCargando(true);

    try {
      const response = await configurationService.obtenerCatalogo(
        catalogo.value,
      );

      setItems(response);

      setCargadoInicial(true);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo cargar el catálogo",
        text: error.message,
      });
    } finally {
      setCargando(false);
    }
  }

  async function guardar(event) {
    event.preventDefault();

    const validacion = parseCatalogForm(form, catalogoActivo);

    if (!validacion.success) {
      setErrors(validacion.errors);

      return;
    }

    setCargando(true);

    try {
      if (editando) {
        await configurationService.actualizarCatalogoItem(
          catalogoActivo.value,
          editando.id,
          validacion.data,
        );
      } else {
        await configurationService.crearCatalogoItem(
          catalogoActivo.value,
          validacion.data,
        );
      }

      limpiarFormulario();

      await cargar(catalogoActivo);

      await Swal.fire({
        icon: "success",
        title: "Registro guardado",
        timer: 1100,
        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: error.message,
      });
    } finally {
      setCargando(false);
    }
  }

  function comenzarEdicion(item) {
    setEditando(item);

    setForm({
      nombre: item.nombre ?? "",

      enlace: item.enlace ?? "",

      permiteActualizarPrecio: Boolean(item.permiteActualizarPrecio),
    });
  }

  async function eliminar(item) {
    const confirmacion = await Swal.fire({
      icon: "warning",

      title: "¿Eliminar registro?",

      text: "Si está siendo utilizado por algún producto, el servidor impedirá su eliminación.",

      showCancelButton: true,

      confirmButtonText: "Eliminar",

      cancelButtonText: "Cancelar",

      confirmButtonColor: "#dc2626",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    try {
      await configurationService.eliminarCatalogoItem(
        catalogoActivo.value,
        item.id,
      );

      await cargar(catalogoActivo);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo eliminar",
        text:
          error.message ||
          "El registro puede estar vinculado a productos existentes.",
      });
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="border-b border-slate-100 pb-5">
        <h2 className="flex items-center gap-2 text-lg font-black text-slate-800">
          <Settings size={21} className="text-brand-700" />
          Catálogos de inventario
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Administra las opciones que aparecen al registrar productos.
        </p>
      </header>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {CONFIG_CATALOGS.map((catalogo) => (
          <button
            key={catalogo.value}
            type="button"
            onClick={() => cambiarCatalogo(catalogo)}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-black transition ${
              catalogoActivo.value === catalogo.value
                ? "bg-slate-800 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {catalogo.label}
          </button>
        ))}
      </div>

      {!cargadoInicial ? (
        <div className="mt-6 flex min-h-52 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
          <button
            type="button"
            onClick={() => cargar()}
            className="rounded-xl bg-brand-700 px-5 py-3 text-xs font-black uppercase text-white"
          >
            Cargar catálogos
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <form
            onSubmit={guardar}
            className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-600">
                {editando ? "Editar registro" : "Nuevo registro"}
              </h3>

              {editando && (
                <button
                  type="button"
                  onClick={limpiarFormulario}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Nombre *
                </label>

                <input
                  type="text"
                  value={form.nombre}
                  onChange={(event) =>
                    setForm((actual) => ({
                      ...actual,
                      nombre: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-bold outline-none focus:border-brand-700"
                />

                {errors.nombre && (
                  <p className="mt-1 text-xs font-bold text-red-600">
                    {errors.nombre}
                  </p>
                )}
              </div>

              {catalogoActivo.extraField === "enlace" && (
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Enlace
                  </label>

                  <input
                    type="url"
                    value={form.enlace}
                    onChange={(event) =>
                      setForm((actual) => ({
                        ...actual,
                        enlace: event.target.value,
                      }))
                    }
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-brand-700"
                  />

                  {errors.enlace && (
                    <p className="mt-1 text-xs font-bold text-red-600">
                      {errors.enlace}
                    </p>
                  )}
                </div>
              )}

              {catalogoActivo.extraField === "permiteActualizarPrecio" && (
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
                  <input
                    type="checkbox"
                    checked={form.permiteActualizarPrecio}
                    onChange={(event) =>
                      setForm((actual) => ({
                        ...actual,

                        permiteActualizarPrecio: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-brand-700"
                  />

                  <span className="text-xs font-bold text-slate-700">
                    Permitir actualizar precio
                  </span>
                </label>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 py-3 text-xs font-black uppercase text-white disabled:opacity-50"
              >
                {editando ? <Edit2 size={15} /> : <Plus size={15} />}

                {editando ? "Actualizar" : "Agregar"}
              </button>
            </div>
          </form>

          <div className="lg:col-span-2">
            <div className="max-h-[480px] space-y-2 overflow-y-auto">
              {cargando ? (
                <div className="flex min-h-52 items-center justify-center">
                  <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-700 border-t-transparent" />
                </div>
              ) : !items.length ? (
                <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center text-sm font-bold text-slate-400">
                  No hay registros.
                </div>
              ) : (
                items.map((item) => (
                  <article
                    key={item.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-black text-slate-800">{item.nombre}</p>

                      {item.enlace && (
                        <a
                          href={item.enlace}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 flex items-center gap-1 text-xs font-bold text-brand-700"
                        >
                          <ExternalLink size={12} />
                          Abrir enlace
                        </a>
                      )}

                      {catalogoActivo.extraField ===
                        "permiteActualizarPrecio" && (
                        <p className="mt-1 text-[10px] font-bold text-slate-400">
                          Actualizar precio:{" "}
                          {item.permiteActualizarPrecio ? "Sí" : "No"}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => comenzarEdicion(item)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-brand-50 hover:text-brand-700"
                      >
                        <Edit2 size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => eliminar(item)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
