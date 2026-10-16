"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { usePathname, useRouter } from "next/navigation";

import Swal from "sweetalert2";

import DashboardHeader from "@/components/dashboard/DashboardHeader";

import DashboardSidebar, {
  obtenerTituloRuta,
  rutaPermitida,
} from "@/components/dashboard/DashboardSidebar";

import { DashboardSessionProvider } from "@/contexts/DashboardSessionContext";

import { crearEstilosMarca } from "@/lib/theme/brandTheme";

import { ApiError } from "@/lib/api/apiClient";

import { authService } from "@/services/authService";

export default function DashboardLayout({ children }) {
  const router = useRouter();

  const pathname = usePathname();

  const [sesion, setSesion] = useState({
    usuario: null,
    cargando: true,
  });

  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const [sidebarContraido, setSidebarContraido] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function verificarSesion() {
      try {
        const usuario = await authService.obtenerUsuarioActual({
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setSesion({
          usuario,
          cargando: false,
        });
      } catch (error) {
        if (error.name === "AbortError" || controller.signal.aborted) {
          return;
        }

        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          router.replace("/");

          return;
        }

        console.error("Error verificando la sesión:", error);

        await Swal.fire({
          icon: "error",

          title: "No se pudo verificar la sesión",

          text: error.message || "No fue posible comunicarse con el servidor.",

          confirmButtonText: "Aceptar",

          confirmButtonColor: "#1d4ed8",
        });

        router.replace("/");
      }
    }

    verificarSesion();

    return () => {
      controller.abort();
    };
  }, [router]);

  useEffect(() => {
    if (!sesion.usuario) {
      return;
    }

    if (!rutaPermitida(pathname, sesion.usuario.rol)) {
      router.replace("/dashboard");
    }
  }, [pathname, router, sesion.usuario]);

  const tituloActual = useMemo(
    () => obtenerTituloRuta(pathname, sesion.usuario?.rol),

    [pathname, sesion.usuario?.rol],
  );

  const actualizarEmpresa = useCallback((nuevaEmpresa) => {
    setSesion((actual) => ({
      ...actual,

      usuario: actual.usuario
        ? {
            ...actual.usuario,

            empresa: {
              ...actual.usuario.empresa,

              ...nuevaEmpresa,
            },
          }
        : null,
    }));
  }, []);

  const estilosMarca = useMemo(
    () => crearEstilosMarca(sesion.usuario?.empresa),

    [sesion.usuario?.empresa],
  );

  const valorContexto = useMemo(
    () => ({
      usuario: sesion.usuario,

      empresa: sesion.usuario?.empresa,

      actualizarEmpresa,
    }),

    [sesion.usuario, actualizarEmpresa],
  );

  async function cerrarSesion() {
    const resultado = await Swal.fire({
      icon: "question",

      title: "¿Cerrar sesión?",

      text: "Tendrás que volver a ingresar tus credenciales para acceder al sistema.",

      showCancelButton: true,

      confirmButtonText: "Cerrar sesión",

      cancelButtonText: "Cancelar",

      confirmButtonColor: "#dc2626",

      cancelButtonColor: "#64748b",

      reverseButtons: true,
    });

    if (!resultado.isConfirmed) {
      return;
    }

    try {
      await authService.cerrarSesion();
    } catch (error) {
      if (
        !(
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        )
      ) {
        await Swal.fire({
          icon: "error",

          title: "No se pudo cerrar la sesión",

          text:
            error.message || "Ocurrió un error al comunicarse con el servidor.",

          confirmButtonText: "Aceptar",

          confirmButtonColor: "#dc2626",
        });

        return;
      }
    }

    router.replace("/");

    router.refresh();
  }

  if (sesion.cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-brand-700 border-t-transparent" />

          <p className="mt-4 text-sm font-black uppercase tracking-widest text-brand-950">
            Cargando interfaz
          </p>
        </div>
      </div>
    );
  }

  if (!sesion.usuario) {
    return null;
  }

  return (
    <DashboardSessionProvider value={valorContexto}>
      <div
        style={estilosMarca}
        className="flex min-h-screen w-full bg-slate-100"
      >
        <DashboardSidebar
          pathname={pathname}
          rol={sesion.usuario.rol}
          empresa={sesion.usuario.empresa}
          abiertoMovil={menuMovilAbierto}
          contraido={sidebarContraido}
          onCerrarMovil={() => setMenuMovilAbierto(false)}
          onAlternarContraido={() => setSidebarContraido((actual) => !actual)}
          onCerrarSesion={cerrarSesion}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader
            titulo={tituloActual}
            usuario={sesion.usuario}
            onAbrirMenu={() => setMenuMovilAbierto(true)}
            onCerrarSesion={cerrarSesion}
          />

          <main className="flex-1 overflow-x-hidden bg-slate-100/80 p-4 md:p-7 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </DashboardSessionProvider>
  );
}
