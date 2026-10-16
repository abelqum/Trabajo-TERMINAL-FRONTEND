"use client";

import { useState } from "react";

import { Database, DownloadCloud, ServerCog } from "lucide-react";

import Swal from "sweetalert2";

import { configurationService } from "@/services/configurationService";

export default function BackupSettings() {
  const [descargando, setDescargando] = useState(false);

  async function descargar() {
    setDescargando(true);

    try {
      await configurationService.descargarRespaldo();

      await Swal.fire({
        icon: "success",
        title: "Respaldo generado",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo generar el respaldo",
        text: error.message,
      });
    } finally {
      setDescargando(false);
    }
  }

  return (
    <section className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-slate-900 p-6 shadow-xl md:flex-row">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-brand-900/60 p-3">
          <Database className="text-brand-400" />
        </div>

        <div>
          <h2 className="font-black text-white">Respaldo del sistema</h2>

          <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-400">
            Genera un archivo JSON con la información persistente del sistema
            para fines de respaldo y recuperación.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={descargar}
        disabled={descargando}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-brand-500 disabled:opacity-50 md:w-auto"
      >
        {descargando ? (
          <ServerCog size={16} className="animate-spin" />
        ) : (
          <DownloadCloud size={16} />
        )}

        {descargando ? "Generando..." : "Descargar JSON"}
      </button>
    </section>
  );
}
