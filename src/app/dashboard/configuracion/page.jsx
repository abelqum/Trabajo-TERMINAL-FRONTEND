"use client";

import { useEffect, useState } from "react";

import { Settings } from "lucide-react";

import Swal from "sweetalert2";
import CompanyBrandingSettings from "@/components/configuration/CompanyBrandingSettings";
import BackupSettings from "@/components/configuration/BackupSettings";
import CatalogManager from "@/components/configuration/CatalogManager";
import KitManager from "@/components/configuration/KitManager";
import ProfileSettings from "@/components/configuration/ProfileSettings";
import SecuritySettings from "@/components/configuration/SecuritySettings";

import { ApiError } from "@/lib/api/apiClient";

import { configurationService } from "@/services/configurationService";

const CONFIG_INICIAL = {
  perfil: {
    id: null,
    nombre: "",
    email: "",
    rol: "",
  },

  permisos: {
    administrarCatalogos: false,

    administrarKits: false,

    descargarRespaldo: false,
  },
};

export default function ConfiguracionPage() {
  const [configuracion, setConfiguracion] = useState(CONFIG_INICIAL);

  const [categorias, setCategorias] = useState([]);

  const [almacenes, setAlmacenes] = useState([]);

  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function cargar() {
      try {
        const config = await configurationService.obtenerConfiguracion({
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setConfiguracion(config);

        if (config.permisos.administrarKits) {
          const [categoriasResponse, almacenesResponse] = await Promise.all([
            configurationService.obtenerCatalogo("categorias", {
              signal: controller.signal,
            }),

            configurationService.obtenerCatalogo("almacenes", {
              signal: controller.signal,
            }),
          ]);

          if (controller.signal.aborted) {
            return;
          }

          setCategorias(categoriasResponse);

          setAlmacenes(almacenesResponse);
        }
      } catch (error) {
        if (error.name === "AbortError" || controller.signal.aborted) {
          return;
        }

        console.error("Error cargando configuración:", error);

        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          return;
        }

        await Swal.fire({
          icon: "error",

          title: "No se pudo cargar la configuración",

          text:
            error.message || "Ocurrió un error consultando la configuración.",
        });
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargar();

    return () => {
      controller.abort();
    };
  }, []);

  function actualizarPerfil(datos) {
    setConfiguracion((actual) => ({
      ...actual,

      perfil: {
        ...actual.perfil,
        ...datos,
      },
    }));
  }

  if (cargando) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-brand-700 border-t-transparent" />

          <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400">
            Cargando configuración
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[90rem] space-y-7 pb-12">
      <header className="border-b border-slate-200 pb-6">
        <h1 className="flex items-center gap-2 text-2xl font-black text-slate-800">
          <Settings className="text-brand-700" />
          Configuración
        </h1>

        <p className="mt-1 text-sm font-medium text-slate-500">
          Perfil, seguridad y parámetros generales del sistema.
        </p>
      </header>
      <CompanyBrandingSettings />
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProfileSettings
          key={configuracion.perfil.id}
          perfil={configuracion.perfil}
          onUpdated={actualizarPerfil}
        />

        <SecuritySettings />
      </section>

      {configuracion.permisos.administrarCatalogos && <CatalogManager />}

      {configuracion.permisos.administrarKits && (
        <KitManager categorias={categorias} almacenes={almacenes} />
      )}

      {configuracion.permisos.descargarRespaldo && <BackupSettings />}
    </div>
  );
}
