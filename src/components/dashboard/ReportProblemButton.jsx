"use client";

import { Bug } from "lucide-react";

import { usePathname } from "next/navigation";

import Swal from "sweetalert2";

import {
  clearLastErrorRequestId,
  getLastErrorRequestId,
} from "@/lib/api/apiClient";

import { problemReportService } from "@/services/problemReportService";

export default function ReportProblemButton() {
  const pathname = usePathname();

  async function handleReport() {
    const requestId = getLastErrorRequestId();

    const result = await Swal.fire({
      icon: "question",

      title: "Reportar un problema",

      text: requestId
        ? "Se adjuntará automáticamente la referencia del último error."
        : "Describe qué problema encontraste.",

      input: "textarea",

      inputLabel: "¿Qué ocurrió?",

      inputPlaceholder:
        "Ejemplo: Intenté guardar un producto y apareció un error...",

      inputAttributes: {
        maxlength: "2000",

        autocapitalize: "sentences",
      },

      showCancelButton: true,

      confirmButtonText: "Enviar reporte",

      cancelButtonText: "Cancelar",

      reverseButtons: true,

      preConfirm: (value) => {
        const description = String(value || "").trim();

        if (description.length < 10) {
          Swal.showValidationMessage(
            "Describe el problema con al menos 10 caracteres.",
          );

          return false;
        }

        return description;
      },
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: "Enviando reporte",

        text: "Espera un momento...",

        allowOutsideClick: false,

        allowEscapeKey: false,

        didOpen: () => {
          Swal.showLoading();
        },
      });

      await problemReportService.report({
        page: pathname || "/dashboard",

        description: result.value,

        requestId,
      });

      clearLastErrorRequestId();

      await Swal.fire({
        icon: "success",

        title: "Reporte enviado",

        text: "Gracias. El problema fue enviado al responsable del sistema.",

        confirmButtonText: "Aceptar",
      });
    } catch (error) {
      console.error("Error enviando reporte:", error);

      await Swal.fire({
        icon: "error",

        title: "No se pudo enviar el reporte",

        text: error?.message || "Intenta nuevamente más tarde.",

        confirmButtonText: "Aceptar",
      });
    }
  }

  return (
    <button
      type="button"
      onClick={handleReport}
      title="Reportar un problema"
      className="
        flex
        items-center
        gap-2

        rounded-xl

        border
        border-slate-200

        bg-white

        px-3
        py-2.5

        text-xs
        font-black
        uppercase
        tracking-wider

        text-slate-600

        transition

        hover:border-brand-300
        hover:bg-brand-50
        hover:text-brand-700
      "
    >
      <Bug size={16} aria-hidden="true" />

      <span className="hidden xl:inline">Reportar problema</span>
    </button>
  );
}
