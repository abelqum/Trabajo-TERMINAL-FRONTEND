"use client";

import { useState } from "react";

import { Camera, Image as ImageIcon, Save, Upload, X } from "lucide-react";

import Swal from "sweetalert2";

import { inventoryService } from "@/services/inventoryService";

import {
  crearEstadoInicialProducto,
  parseProductForm,
} from "@/validations/inventorySchema";

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-800 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10 disabled:cursor-not-allowed disabled:opacity-60";

function CatalogSelect({
  label,
  value,
  items = [],
  onChange,
  disabled = false,
  placeholder = "Sin asignar",
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={INPUT_CLASS}
      >
        <option value="">{placeholder}</option>

        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function ProductFormModal({
  producto = null,
  catalogos,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState(() => crearEstadoInicialProducto(producto));

  const [errors, setErrors] = useState({});

  const [foto, setFoto] = useState(null);

  const [preview, setPreview] = useState(producto?.fotoUrl ?? null);

  const [guardando, setGuardando] = useState(false);

  const editando = Boolean(producto?.id);

  function limpiarError(campo) {
    if (!errors[campo]) {
      return;
    }

    setErrors((actual) => {
      const nuevos = {
        ...actual,
      };

      delete nuevos[campo];

      return nuevos;
    });
  }

  function actualizar(campo, valor) {
    setForm((actual) => ({
      ...actual,
      [campo]: valor,
    }));

    limpiarError(campo);
  }

  function seleccionarFoto(archivo) {
    if (!archivo) {
      return;
    }

    if (!archivo.type.startsWith("image/")) {
      Swal.fire({
        icon: "warning",
        title: "Archivo no válido",
        text: "Selecciona una imagen.",
      });

      return;
    }

    setFoto(archivo);

    const reader = new FileReader();

    reader.onload = () => {
      setPreview(reader.result);
    };

    reader.readAsDataURL(archivo);
  }

  function quitarFotoNueva() {
    setFoto(null);

    setPreview(producto?.fotoUrl ?? null);
  }

  async function guardar(event) {
    event.preventDefault();

    const validacion = parseProductForm(form, {
      editando,
    });

    if (!validacion.success) {
      setErrors(validacion.errors);

      return;
    }

    setGuardando(true);

    try {
      if (editando) {
        await inventoryService.actualizarProducto(
          producto.id,
          validacion.data,
          foto,
        );
      } else {
        await inventoryService.crearProducto(validacion.data, foto);
      }

      await Swal.fire({
        icon: "success",

        title: editando ? "Producto actualizado" : "Producto registrado",

        timer: 1400,

        showConfirmButton: false,
      });

      onSaved();
    } catch (error) {
      console.error("Error guardando producto:", error);

      await Swal.fire({
        icon: "error",
        title: "No se pudo guardar el producto",
        text: error.message || "Ocurrió un error inesperado.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !guardando) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-black text-slate-800">
              {editando ? "Editar producto" : "Nuevo producto"}
            </h2>

            <p className="mt-1 text-xs font-medium text-slate-500">
              Información general, ubicación, existencias y valoración.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            aria-label="Cerrar"
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </header>

        <form
          id="product-form"
          onSubmit={guardar}
          className="flex-1 space-y-6 overflow-y-auto p-6"
        >
          {/* Fotografía */}
          <section className="flex flex-col items-center gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {preview ? (
                <img
                  src={preview}
                  alt="Vista previa del producto"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon size={38} className="text-slate-300" />
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-black text-slate-800">
                Fotografía del producto
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                La fotografía será optimizada y convertida a WebP antes de
                enviarse al servidor.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-black text-white transition hover:bg-brand-800">
                  <Upload size={15} />
                  Seleccionar
                  <input
                    type="file"
                    accept="image/*"
                    disabled={guardando}
                    className="hidden"
                    onChange={(event) =>
                      seleccionarFoto(event.target.files?.[0])
                    }
                  />
                </label>

                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-black text-slate-700 transition hover:bg-slate-100">
                  <Camera size={15} />
                  Cámara
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    disabled={guardando}
                    className="hidden"
                    onChange={(event) =>
                      seleccionarFoto(event.target.files?.[0])
                    }
                  />
                </label>

                {foto && (
                  <button
                    type="button"
                    onClick={quitarFotoNueva}
                    disabled={guardando}
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-black text-red-700 transition hover:bg-red-100"
                  >
                    Quitar cambio
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Datos generales */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-5 text-sm font-black uppercase tracking-wider text-slate-700">
              Datos generales
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Descripción *
                </label>

                <input
                  type="text"
                  value={form.descripcion}
                  onChange={(event) =>
                    actualizar("descripcion", event.target.value)
                  }
                  disabled={guardando}
                  placeholder="Ej. Taladro inalámbrico"
                  className={INPUT_CLASS}
                />

                {errors.descripcion && (
                  <p className="mt-1.5 text-xs font-bold text-red-600">
                    {errors.descripcion}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Modelo
                </label>

                <input
                  type="text"
                  value={form.modelo}
                  onChange={(event) => actualizar("modelo", event.target.value)}
                  disabled={guardando}
                  placeholder="Ej. DCD777"
                  className={INPUT_CLASS}
                />

                {errors.modelo && (
                  <p className="mt-1.5 text-xs font-bold text-red-600">
                    {errors.modelo}
                  </p>
                )}
              </div>

              <CatalogSelect
                label="Categoría"
                value={form.categoriaId}
                items={catalogos?.categorias ?? []}
                disabled={guardando}
                onChange={(valor) => actualizar("categoriaId", valor)}
              />

              <CatalogSelect
                label="Marca"
                value={form.marcaId}
                items={catalogos?.marcas ?? []}
                disabled={guardando}
                onChange={(valor) => actualizar("marcaId", valor)}
              />

              <CatalogSelect
                label="Unidad de medida"
                value={form.unidadMedidaId}
                items={catalogos?.unidadesMedida ?? []}
                disabled={guardando}
                onChange={(valor) => actualizar("unidadMedidaId", valor)}
              />

              <CatalogSelect
                label="Proveedor"
                value={form.proveedorId}
                items={catalogos?.proveedores ?? []}
                disabled={guardando}
                onChange={(valor) => actualizar("proveedorId", valor)}
              />

              <CatalogSelect
                label="Almacén"
                value={form.almacenId}
                items={catalogos?.almacenes ?? []}
                disabled={guardando}
                onChange={(valor) => actualizar("almacenId", valor)}
              />

              <CatalogSelect
                label="Condición"
                value={form.condicionId}
                items={catalogos?.condiciones ?? []}
                disabled={guardando}
                onChange={(valor) => actualizar("condicionId", valor)}
              />

              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Fila / ubicación
                </label>

                <input
                  type="text"
                  value={form.fila}
                  onChange={(event) => actualizar("fila", event.target.value)}
                  disabled={guardando}
                  placeholder="Ej. A-03"
                  className={INPUT_CLASS}
                />

                {errors.fila && (
                  <p className="mt-1.5 text-xs font-bold text-red-600">
                    {errors.fila}
                  </p>
                )}
              </div>

              {/* Medida opcional */}
              <div className="md:col-span-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <input
                    type="checkbox"
                    checked={form.aplicaMedida}
                    onChange={(event) => {
                      const activo = event.target.checked;

                      actualizar("aplicaMedida", activo);

                      if (!activo) {
                        actualizar("medidaId", "");
                      }
                    }}
                    disabled={guardando}
                    className="h-4 w-4 accent-brand-700"
                  />

                  <div>
                    <p className="text-xs font-black text-slate-700">
                      Utiliza una medida específica
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      Ej. diámetro, longitud, calibre o presentación.
                    </p>
                  </div>
                </label>

                {form.aplicaMedida && (
                  <div className="mt-3">
                    <CatalogSelect
                      label="Medida"
                      value={form.medidaId}
                      items={catalogos?.medidas ?? []}
                      disabled={guardando}
                      placeholder="Selecciona una medida"
                      onChange={(valor) => actualizar("medidaId", valor)}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Costos y stock */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-5 text-sm font-black uppercase tracking-wider text-slate-700">
              Valoración y existencias
            </h3>

            <div
              className={`grid grid-cols-1 gap-4 ${
                editando ? "sm:grid-cols-2" : "sm:grid-cols-3"
              }`}
            >
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Precio unitario
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-black text-slate-400">
                    $
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.precioUnitario}
                    onChange={(event) =>
                      actualizar("precioUnitario", event.target.value)
                    }
                    disabled={guardando}
                    className={`${INPUT_CLASS} pl-8`}
                  />
                </div>

                {errors.precioUnitario && (
                  <p className="mt-1.5 text-xs font-bold text-red-600">
                    {errors.precioUnitario}
                  </p>
                )}
              </div>

              {!editando && (
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Stock inicial
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.cantidadInicial}
                    onChange={(event) =>
                      actualizar("cantidadInicial", event.target.value)
                    }
                    disabled={guardando}
                    className={INPUT_CLASS}
                  />

                  {errors.cantidadInicial && (
                    <p className="mt-1.5 text-xs font-bold text-red-600">
                      {errors.cantidadInicial}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-red-600">
                  Stock mínimo
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.stockMinimo}
                  onChange={(event) =>
                    actualizar("stockMinimo", event.target.value)
                  }
                  disabled={guardando}
                  className={`${INPUT_CLASS} border-red-200 bg-red-50`}
                />

                {errors.stockMinimo && (
                  <p className="mt-1.5 text-xs font-bold text-red-600">
                    {errors.stockMinimo}
                  </p>
                )}
              </div>
            </div>

            {editando && (
              <div className="mt-5 rounded-xl border border-brand-200 bg-brand-50 p-4">
                <p className="text-xs font-bold leading-relaxed text-brand-800">
                  La existencia actual no se modifica desde este formulario. Las
                  entradas y salidas se realizan mediante ajustes de inventario
                  para conservar el historial de movimientos.
                </p>
              </div>
            )}
          </section>
        </form>

        <footer className="flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-slate-50 p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="product-form"
            disabled={guardando}
            className="flex items-center gap-2 rounded-xl bg-brand-700 px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Save size={16} />
            )}

            {guardando
              ? "Guardando..."
              : editando
                ? "Actualizar producto"
                : "Guardar producto"}
          </button>
        </footer>
      </div>
    </div>
  );
}
