"use client";

import { useEffect, useRef, useState } from "react";

import {
  Camera,
  ExternalLink,
  FileImage,
  Images,
  LoaderCircle,
  Trash2,
  Upload,
} from "lucide-react";

import Swal from "sweetalert2";

import { tasksService } from "@/services/tasksService";

function formatearTamano(bytes) {
  const cantidad = Number(bytes || 0);

  if (cantidad < 1024) {
    return `${cantidad} B`;
  }

  if (cantidad < 1024 * 1024) {
    return `${(cantidad / 1024).toFixed(1)} KB`;
  }

  return `${(cantidad / (1024 * 1024)).toFixed(1)} MB`;
}

function formatearFecha(fecha) {
  if (!fecha) {
    return "";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(fecha));
}

export default function TaskEvidence({ tarea }) {
  const inputCamaraRef = useRef(null);

  const inputGaleriaRef = useRef(null);

  const [evidencias, setEvidencias] = useState([]);

  const [cargando, setCargando] = useState(true);

  const [subiendo, setSubiendo] = useState(false);

  const [eliminandoId, setEliminandoId] = useState(null);

  async function recargar() {
    const response = await tasksService.obtenerEvidencias(tarea.id);

    setEvidencias(response);
  }

  useEffect(() => {
    const controller = new AbortController();

    async function cargar() {
      try {
        const response = await tasksService.obtenerEvidencias(tarea.id, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setEvidencias(response);

        setCargando(false);
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        console.error(error);

        setCargando(false);
      }
    }

    cargar();

    return () => {
      controller.abort();
    };
  }, [tarea.id]);

  async function subirArchivos(archivos) {
    if (!archivos?.length) {
      return;
    }

    setSubiendo(true);

    try {
      await tasksService.subirEvidencias(tarea.id, archivos);

      await recargar();

      await Swal.fire({
        icon: "success",
        title: "Evidencias guardadas",
        timer: 1300,
        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudieron subir las evidencias",
        text: error.message,
      });
    } finally {
      setSubiendo(false);

      if (inputCamaraRef.current) {
        inputCamaraRef.current.value = "";
      }

      if (inputGaleriaRef.current) {
        inputGaleriaRef.current.value = "";
      }
    }
  }

  async function eliminar(evidencia) {
    const resultado = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar evidencia?",
      text: "La imagen dejará de estar disponible.",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
    });

    if (!resultado.isConfirmed) {
      return;
    }

    setEliminandoId(evidencia.id);

    try {
      await tasksService.eliminarEvidencia(tarea.id, evidencia.id);

      setEvidencias((actuales) =>
        actuales.filter((elemento) => elemento.id !== evidencia.id),
      );
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo eliminar",
        text: error.message,
      });
    } finally {
      setEliminandoId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-700">
            <FileImage size={18} className="text-brand-700" />
            Evidencias
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Fotografías optimizadas automáticamente.
          </p>
        </div>

        {tarea.permisos.subirEvidencias && tarea.estado !== "COMPLETADA" && (
          <div className="flex gap-2">
            <input
              ref={inputCamaraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(event) => subirArchivos(event.target.files)}
            />

            <input
              ref={inputGaleriaRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => subirArchivos(event.target.files)}
            />

            <button
              type="button"
              disabled={subiendo}
              onClick={() => inputCamaraRef.current?.click()}
              className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-black text-brand-700"
            >
              <Camera size={15} />
              Cámara
            </button>

            <button
              type="button"
              disabled={subiendo}
              onClick={() => inputGaleriaRef.current?.click()}
              className="flex items-center gap-2 rounded-xl bg-brand-700 px-3 py-2 text-xs font-black text-white"
            >
              {subiendo ? (
                <LoaderCircle size={15} className="animate-spin" />
              ) : (
                <Upload size={15} />
              )}
              Subir
            </button>
          </div>
        )}
      </div>

      {cargando ? (
        <div className="flex min-h-32 items-center justify-center">
          <LoaderCircle className="animate-spin text-brand-700" />
        </div>
      ) : !evidencias.length ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center">
          <Images size={34} className="mx-auto text-slate-300" />

          <p className="mt-3 text-sm font-black text-slate-500">
            No hay evidencias
          </p>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {evidencias.map((evidencia) => (
            <article
              key={evidencia.id}
              className="overflow-hidden rounded-2xl border border-slate-200"
            >
              <a
                href={evidencia.url}
                target="_blank"
                rel="noreferrer"
                className="block aspect-video overflow-hidden bg-slate-200"
              >
                <img
                  src={evidencia.url}
                  alt={evidencia.nombreOriginal}
                  className="h-full w-full object-cover"
                />
              </a>

              <div className="p-4">
                <p className="truncate text-xs font-black text-slate-800">
                  {evidencia.nombreOriginal}
                </p>

                <p className="mt-1 text-[10px] text-slate-500">
                  {formatearTamano(evidencia.tamanoBytes)} ·{" "}
                  {formatearFecha(evidencia.creadoEn)}
                </p>

                <p className="mt-1 text-[10px] font-bold text-brand-700">
                  Subida por {evidencia.autor?.nombre || "Usuario"}
                </p>

                <div className="mt-3 flex gap-2">
                  <a
                    href={evidencia.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-[10px] font-black uppercase text-white"
                  >
                    <ExternalLink size={13} />
                    Abrir
                  </a>

                  {evidencia.puedeEliminar && (
                    <button
                      type="button"
                      onClick={() => eliminar(evidencia)}
                      disabled={eliminandoId === evidencia.id}
                      className="rounded-lg bg-red-50 p-2.5 text-red-700"
                    >
                      {eliminandoId === evidencia.id ? (
                        <LoaderCircle size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
