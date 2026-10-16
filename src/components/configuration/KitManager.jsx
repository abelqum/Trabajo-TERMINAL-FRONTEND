"use client";

import { useState } from "react";

import {
  Camera,
  Edit2,
  Image as ImageIcon,
  PackageOpen,
  Plus,
  Save,
  Trash2,
  Upload,
  Wrench,
  X,
} from "lucide-react";

import Swal from "sweetalert2";

import { configurationService } from "@/services/configurationService";

import {
  crearEstadoKit,
  parseKitForm,
} from "@/validations/configurationSchema";

export default function KitManager({ categorias, almacenes }) {
  const [kits, setKits] = useState([]);

  const [productos, setProductos] = useState([]);

  const [cargando, setCargando] = useState(false);

  const [cargado, setCargado] = useState(false);

  const [editando, setEditando] = useState(null);

  const [form, setForm] = useState(() => crearEstadoKit());

  const [foto, setFoto] = useState(null);

  const [preview, setPreview] = useState(null);

  async function cargarDatos() {
    setCargando(true);

    try {
      const [listaKits, listaProductos] = await Promise.all([
        configurationService.obtenerKits(),

        configurationService.obtenerProductosParaKits(),
      ]);

      setKits(listaKits);

      setProductos(listaProductos);

      setCargado(true);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudieron cargar los kits",
        text: error.message,
      });
    } finally {
      setCargando(false);
    }
  }

  function limpiar() {
    setEditando(null);

    setForm(crearEstadoKit());

    setFoto(null);

    setPreview(null);
  }

  function editar(kit) {
    setEditando(kit);

    setForm(crearEstadoKit(kit));

    setFoto(null);

    setPreview(kit.fotoUrl ?? null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function seleccionarFoto(archivo) {
    if (!archivo) {
      return;
    }

    if (!archivo.type.startsWith("image/")) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona una imagen",
      });

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setPreview(reader.result);
    };

    reader.readAsDataURL(archivo);

    setFoto(archivo);
  }

  function actualizar(campo, valor) {
    setForm((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  function actualizarComponente(index, campo, valor) {
    setForm((actual) => ({
      ...actual,

      componentes: actual.componentes.map((componente, posicion) =>
        posicion === index
          ? {
              ...componente,
              [campo]: valor,
            }
          : componente,
      ),
    }));
  }

  function agregarComponente() {
    setForm((actual) => ({
      ...actual,

      componentes: [
        ...actual.componentes,

        {
          productoId: "",
          cantidadNecesaria: "1",
        },
      ],
    }));
  }

  function quitarComponente(index) {
    setForm((actual) => ({
      ...actual,

      componentes: actual.componentes.filter(
        (_, posicion) => posicion !== index,
      ),
    }));
  }

  async function guardar(event) {
    event.preventDefault();

    const validacion = parseKitForm(form);

    if (!validacion.success) {
      await Swal.fire({
        icon: "warning",
        title: "Revisa el kit",
        text: validacion.errors.general,
      });

      return;
    }

    setCargando(true);

    try {
      if (editando) {
        await configurationService.actualizarKit(
          editando.id,
          validacion.data,
          foto,
        );
      } else {
        await configurationService.crearKit(validacion.data, foto);
      }

      limpiar();

      await cargarDatos();

      await Swal.fire({
        icon: "success",

        title: editando ? "Kit actualizado" : "Kit creado",

        timer: 1300,

        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo guardar el kit",
        text: error.message,
      });
    } finally {
      setCargando(false);
    }
  }

  async function eliminar(kit) {
    const confirmacion = await Swal.fire({
      icon: "warning",

      title: "¿Eliminar kit?",

      text: "La definición del ensamble será eliminada. El servidor impedirá la operación si existe información que deba conservarse.",

      showCancelButton: true,

      confirmButtonText: "Eliminar",

      cancelButtonText: "Cancelar",

      confirmButtonColor: "#dc2626",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    try {
      await configurationService.eliminarKit(kit.id);

      await cargarDatos();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo eliminar",
        text: error.message,
      });
    }
  }

  function nombreProducto(producto) {
    const partes = [producto.descripcion];

    if (producto.modelo) {
      partes.push(`Mod: ${producto.modelo}`);
    }

    if (producto.medida?.nombre) {
      partes.push(producto.medida.nombre);
    }

    if (producto.marca?.nombre) {
      partes.push(`Marca: ${producto.marca.nombre}`);
    }

    return partes.join(" | ");
  }

  if (!cargado) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-black text-slate-800">
          <Wrench className="text-brand-700" />
          Kits / Ensambles
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Define qué productos componen cada kit.
        </p>

        <button
          type="button"
          onClick={cargarDatos}
          disabled={cargando}
          className="mt-5 rounded-xl bg-brand-700 px-5 py-3 text-xs font-black uppercase text-white"
        >
          {cargando ? "Cargando..." : "Administrar kits"}
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="border-b border-slate-100 pb-5">
        <h2 className="flex items-center gap-2 text-lg font-black text-slate-800">
          <Wrench size={21} className="text-brand-700" />
          Kits / Ensambles
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Define la receta del kit. Su existencia se modifica desde Inventario
          mediante armar o desarmar.
        </p>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
        <form
          onSubmit={guardar}
          className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 xl:col-span-2"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-800">
              {editando ? "Editar kit" : "Nuevo kit"}
            </h3>

            {editando && (
              <button
                type="button"
                onClick={limpiar}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-200"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200">
              {preview ? (
                <img
                  src={preview}
                  alt="Kit"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon className="text-slate-300" />
              )}
            </div>

            <div className="flex gap-2">
              <label className="cursor-pointer rounded-xl bg-brand-50 p-3 text-brand-700">
                <Upload size={17} />

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => seleccionarFoto(event.target.files?.[0])}
                />
              </label>

              <label className="cursor-pointer rounded-xl bg-emerald-50 p-3 text-emerald-700">
                <Camera size={17} />

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(event) => seleccionarFoto(event.target.files?.[0])}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">
              Nombre del kit *
            </label>

            <input
              value={form.descripcion}
              onChange={(event) =>
                actualizar("descripcion", event.target.value)
              }
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-bold outline-none focus:border-brand-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-black uppercase text-slate-500">
                Categoría
              </label>

              <select
                value={form.categoriaId}
                onChange={(event) =>
                  actualizar("categoriaId", event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-bold"
              >
                <option value="">Sin categoría</option>

                {categorias.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-black uppercase text-slate-500">
                Almacén
              </label>

              <select
                value={form.almacenId}
                onChange={(event) =>
                  actualizar("almacenId", event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-bold"
              >
                <option value="">Sin almacén</option>

                {almacenes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-black uppercase text-slate-500">
                Ubicación
              </label>

              <input
                value={form.fila}
                onChange={(event) => actualizar("fila", event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-bold"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-black uppercase text-slate-500">
                Precio unitario
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={form.precioUnitario}
                onChange={(event) =>
                  actualizar("precioUnitario", event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-bold"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-700">
                Componentes
              </h4>

              <button
                type="button"
                onClick={agregarComponente}
                className="flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-2 text-[10px] font-black uppercase text-brand-700"
              >
                <Plus size={13} />
                Agregar
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {form.componentes.map((componente, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-white p-3"
                >
                  <select
                    value={componente.productoId}
                    onChange={(event) =>
                      actualizarComponente(
                        index,
                        "productoId",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-bold"
                  >
                    <option value="">Selecciona producto</option>

                    {productos.map((producto) => (
                      <option key={producto.id} value={producto.id}>
                        {nombreProducto(producto)} — Stock: {producto.cantidad}
                      </option>
                    ))}
                  </select>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-slate-400">
                      Cantidad requerida
                    </span>

                    <input
                      type="number"
                      min="0.01"
                      step="1"
                      value={componente.cantidadNecesaria}
                      onChange={(event) =>
                        actualizarComponente(
                          index,
                          "cantidadNecesaria",
                          event.target.value,
                        )
                      }
                      className="w-24 rounded-lg border border-slate-300 p-2 text-center text-xs font-black"
                    />

                    {form.componentes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => quitarComponente(index)}
                        className="ml-auto rounded-lg p-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 py-3 text-xs font-black uppercase text-white disabled:opacity-50"
          >
            <Save size={15} />

            {cargando
              ? "Guardando..."
              : editando
                ? "Actualizar kit"
                : "Crear kit"}
          </button>
        </form>

        <div className="space-y-3 xl:col-span-3">
          {kits.length === 0 ? (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-slate-300">
              <div className="text-center">
                <PackageOpen size={38} className="mx-auto text-slate-300" />

                <p className="mt-3 font-black text-slate-500">
                  No hay kits definidos
                </p>
              </div>
            </div>
          ) : (
            kits.map((kit) => (
              <article
                key={kit.id}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {kit.fotoUrl ? (
                      <img
                        src={kit.fotoUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Wrench className="text-slate-300" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-black text-slate-800">
                          {kit.descripcion}
                        </h3>

                        <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-brand-600">
                          Stock armado: {kit.cantidad}
                        </p>
                      </div>

                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => editar(kit)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-brand-50 hover:text-brand-700"
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => eliminar(kit)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {kit.componentes.map((componente) => (
                        <span
                          key={componente.productoId}
                          className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600"
                        >
                          {componente.producto?.descripcion} ×{" "}
                          {componente.cantidadNecesaria}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
