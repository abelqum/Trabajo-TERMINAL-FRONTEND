"use client";

import { useEffect, useState } from "react";

import { Building2, ImagePlus, Palette, Save, Trash2 } from "lucide-react";

import Swal from "sweetalert2";

import { useDashboardSession } from "@/contexts/DashboardSessionContext";

import { companyService } from "@/services/companyService";

const COLORES_PRINCIPALES = [
  "#1D4ED8",
  "#7C3AED",
  "#0F766E",
  "#B45309",
  "#BE123C",
  "#334155",
];

const COLORES_SIDEBAR = [
  "#172554",
  "#111827",
  "#1E293B",
  "#3F3F46",
  "#052E16",
  "#4C0519",
];

export default function CompanyBrandingSettings() {
  const { usuario, empresa, actualizarEmpresa } = useDashboardSession();

  const puedeEditar = usuario?.rol === "admin";

  // =====================================================
  // FORM STATE
  // =====================================================

  const [nombre, setNombre] = useState(() => empresa?.nombre || "");

  const [colorPrincipal, setColorPrincipal] = useState(
    () => empresa?.colorPrincipal || "#1D4ED8",
  );

  const [colorSidebar, setColorSidebar] = useState(
    () => empresa?.colorSidebar || "#172554",
  );

  const [logo, setLogo] = useState(null);

  const [previewUrl, setPreviewUrl] = useState(null);

  const [guardando, setGuardando] = useState(false);

  // =====================================================
  // PREVIEW CLEANUP
  // =====================================================

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // =====================================================
  // LOGO SELECTION
  // =====================================================

  function seleccionarLogo(event) {
    const archivo = event.target.files?.[0] || null;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (!archivo) {
      setLogo(null);

      setPreviewUrl(null);

      return;
    }

    if (!archivo.type?.startsWith("image/")) {
      event.target.value = "";

      Swal.fire({
        icon: "warning",

        title: "Archivo no válido",

        text: "Selecciona una imagen para utilizarla como logo.",

        confirmButtonText: "Aceptar",
      });

      setLogo(null);

      setPreviewUrl(null);

      return;
    }

    setLogo(archivo);

    setPreviewUrl(URL.createObjectURL(archivo));
  }

  // =====================================================
  // SAVE
  // =====================================================

  async function guardar() {
    const nombreNormalizado = nombre.trim();

    if (nombreNormalizado.length < 2) {
      await Swal.fire({
        icon: "warning",

        title: "Nombre inválido",

        text: "Escribe el nombre de la empresa.",

        confirmButtonText: "Aceptar",
      });

      return;
    }

    setGuardando(true);

    try {
      const actualizada = await companyService.actualizarEmpresa(
        {
          nombre: nombreNormalizado,

          colorPrincipal,

          colorSidebar,
        },

        logo,
      );

      actualizarEmpresa(actualizada);

      setLogo(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(null);

      await Swal.fire({
        icon: "success",

        title: "Identidad actualizada",

        text: "Los cambios se aplicaron inmediatamente en el sistema.",

        timer: 1400,

        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",

        title: "No se pudo actualizar la empresa",

        text: error.message || "Ocurrió un error guardando la configuración.",

        confirmButtonText: "Aceptar",
      });
    } finally {
      setGuardando(false);
    }
  }

  // =====================================================
  // DELETE LOGO
  // =====================================================

  async function eliminarLogo() {
    const resultado = await Swal.fire({
      icon: "question",

      title: "¿Eliminar logo?",

      text: "El sistema volverá a mostrar las iniciales de la empresa.",

      showCancelButton: true,

      confirmButtonText: "Eliminar",

      cancelButtonText: "Cancelar",

      confirmButtonColor: "#dc2626",

      reverseButtons: true,
    });

    if (!resultado.isConfirmed) {
      return;
    }

    try {
      const actualizada = await companyService.eliminarLogo();

      actualizarEmpresa(actualizada);

      setLogo(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(null);

      await Swal.fire({
        icon: "success",

        title: "Logo eliminado",

        timer: 1200,

        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",

        title: "No se pudo eliminar el logo",

        text: error.message || "Ocurrió un error eliminando el logo.",

        confirmButtonText: "Aceptar",
      });
    }
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 bg-slate-50 px-6 py-5">
        <h2 className="flex items-center gap-2 text-lg font-black text-slate-800">
          <Building2 size={20} className="text-brand-700" />
          Identidad de la empresa
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Personaliza cómo se verá el sistema para tu empresa.
        </p>
      </header>

      <div className="grid gap-8 p-6 lg:grid-cols-[240px_1fr]">
        {/* =================================================
            LOGO
        ================================================= */}

        <div>
          <p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-500">
            Logo
          </p>

          <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
            {previewUrl || empresa?.logoUrl ? (
              <img
                src={previewUrl || empresa.logoUrl}
                alt="Logo de la empresa"
                className="h-full w-full object-contain p-5"
              />
            ) : (
              <div className="text-center text-slate-400">
                <Building2 size={44} className="mx-auto" />

                <p className="mt-2 text-sm font-bold">Sin logo</p>
              </div>
            )}
          </div>

          {puedeEditar && (
            <>
              <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-brand-400 hover:text-brand-700">
                <ImagePlus size={18} />
                Seleccionar logo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={seleccionarLogo}
                />
              </label>

              {empresa?.logoUrl && (
                <button
                  type="button"
                  onClick={eliminarLogo}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 size={17} />
                  Eliminar logo
                </button>
              )}
            </>
          )}

          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            La imagen se optimiza automáticamente a WebP, con un máximo de 512
            px y aproximadamente 150 KB.
          </p>
        </div>

        {/* =================================================
            SETTINGS
        ================================================= */}

        <div className="space-y-7">
          {/* COMPANY NAME */}

          <div>
            <label
              htmlFor="company-name"
              className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500"
            >
              Nombre de la empresa
            </label>

            <input
              id="company-name"
              value={nombre}
              disabled={!puedeEditar || guardando}
              maxLength={200}
              onChange={(event) => setNombre(event.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 font-bold text-slate-800 outline-none transition focus:border-brand-700 disabled:bg-slate-100"
            />
          </div>

          {/* PRIMARY COLOR */}

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Palette size={18} className="text-brand-700" />

              <h3 className="font-black text-slate-800">Color principal</h3>
            </div>

            <p className="mb-4 text-sm text-slate-500">
              Se utilizará en botones, enlaces, elementos activos y acentos.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {COLORES_PRINCIPALES.map((color) => (
                <button
                  key={color}
                  type="button"
                  disabled={!puedeEditar}
                  onClick={() => setColorPrincipal(color)}
                  style={{
                    backgroundColor: color,
                  }}
                  className={`h-10 w-10 rounded-full border-4 transition ${
                    colorPrincipal === color
                      ? "scale-110 border-slate-800"
                      : "border-white shadow"
                  }`}
                  aria-label={`Color ${color}`}
                />
              ))}

              <input
                type="color"
                value={colorPrincipal}
                disabled={!puedeEditar}
                onChange={(event) =>
                  setColorPrincipal(event.target.value.toUpperCase())
                }
                className="h-10 w-14 cursor-pointer rounded-lg"
              />

              <code className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                {colorPrincipal}
              </code>
            </div>
          </div>

          {/* SIDEBAR COLOR */}

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Palette size={18} className="text-slate-700" />

              <h3 className="font-black text-slate-800">
                Color del menú lateral
              </h3>
            </div>

            <p className="mb-4 text-sm text-slate-500">
              Recomendamos tonos oscuros para mantener buena legibilidad.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {COLORES_SIDEBAR.map((color) => (
                <button
                  key={color}
                  type="button"
                  disabled={!puedeEditar}
                  onClick={() => setColorSidebar(color)}
                  style={{
                    backgroundColor: color,
                  }}
                  className={`h-10 w-10 rounded-full border-4 transition ${
                    colorSidebar === color
                      ? "scale-110 border-slate-800"
                      : "border-white shadow"
                  }`}
                  aria-label={`Color ${color}`}
                />
              ))}

              <input
                type="color"
                value={colorSidebar}
                disabled={!puedeEditar}
                onChange={(event) =>
                  setColorSidebar(event.target.value.toUpperCase())
                }
                className="h-10 w-14 cursor-pointer rounded-lg"
              />

              <code className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                {colorSidebar}
              </code>
            </div>
          </div>

          {/* PREVIEW */}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="mb-4 text-xs font-black uppercase tracking-wider text-slate-500">
              Vista previa
            </p>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex h-36">
                <div
                  style={{
                    backgroundColor: colorSidebar,
                  }}
                  className="w-28 p-3"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-8 w-8 overflow-hidden rounded-lg bg-white/10">
                      {(previewUrl || empresa?.logoUrl) && (
                        <img
                          src={previewUrl || empresa.logoUrl}
                          alt=""
                          className="h-full w-full object-contain p-1"
                        />
                      )}
                    </div>

                    <div className="h-2 flex-1 rounded bg-white/30" />
                  </div>

                  <div
                    style={{
                      backgroundColor: colorPrincipal,
                    }}
                    className="mb-2 h-7 rounded-lg"
                  />

                  <div className="mb-2 h-7 rounded-lg bg-white/10" />

                  <div className="h-7 rounded-lg bg-white/10" />
                </div>

                <div className="flex-1 p-4">
                  <p className="mb-1 truncate text-xs font-black text-slate-700">
                    {nombre || "Nombre de la empresa"}
                  </p>

                  <div className="mb-5 h-2 w-32 rounded bg-slate-100" />

                  <button
                    type="button"
                    style={{
                      backgroundColor: colorPrincipal,
                    }}
                    className="rounded-lg px-4 py-2 text-xs font-bold text-white"
                  >
                    Botón principal
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SAVE */}

          {puedeEditar && (
            <button
              type="button"
              onClick={guardar}
              disabled={guardando}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 py-3 font-black text-white shadow-lg transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardando ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={19} />
                  Guardar identidad
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
