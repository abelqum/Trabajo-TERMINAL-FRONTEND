"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import Swal from "sweetalert2";

import EmployeeDashboard from "@/components/dashboard/home/EmployeeDashboard";
import FinancialDashboard from "@/components/dashboard/home/FinancialDashboard";

import { ApiError } from "@/lib/api/apiClient";

import { dashboardService } from "@/services/dashboardService";

export default function DashboardPage() {
  const router = useRouter();

  const [estado, setEstado] = useState({
    cargando: true,
    datos: null,
    error: false,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function cargarDashboard() {
      try {
        const datos = await dashboardService.obtenerInicio({
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setEstado({
          cargando: false,
          datos,
          error: false,
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

        console.error("Error cargando dashboard:", error);

        await Swal.fire({
          icon: "error",
          title: "No se pudo cargar el dashboard",
          text:
            error.message || "Ocurrió un error al consultar la información.",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#1d4ed8",
        });

        if (controller.signal.aborted) {
          return;
        }

        setEstado({
          cargando: false,
          datos: null,
          error: true,
        });
      }
    }

    cargarDashboard();

    return () => {
      controller.abort();
    };
  }, [router]);

  if (estado.cargando) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-brand-700 border-t-transparent" />

          <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-500">
            Cargando dashboard
          </p>
        </div>
      </div>
    );
  }

  if (estado.error || !estado.datos) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-black text-slate-800">
            Dashboard no disponible
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            No fue posible obtener la información del servidor.
          </p>
        </div>
      </div>
    );
  }

  const tipoVista = String(estado.datos.tipoVista ?? "").toUpperCase();

  if (tipoVista === "EMPLEADO") {
    return <EmployeeDashboard datos={estado.datos} />;
  }

  if (tipoVista === "FINANCIERA") {
    return <FinancialDashboard datos={estado.datos} />;
  }

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8">
      <h1 className="font-black text-amber-900">
        Vista de dashboard no reconocida
      </h1>

      <p className="mt-2 text-sm text-amber-700">
        El backend devolvió un tipo de dashboard que el frontend no conoce.
      </p>
    </div>
  );
}
