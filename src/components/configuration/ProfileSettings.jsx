"use client";

import { useState } from "react";

import { Save, UserRound } from "lucide-react";

import Swal from "sweetalert2";

import { configurationService } from "@/services/configurationService";

import { parseProfileForm } from "@/validations/configurationSchema";

export default function ProfileSettings({ perfil, onUpdated }) {
  const [nombre, setNombre] = useState(perfil.nombre);

  const [error, setError] = useState("");

  const [guardando, setGuardando] = useState(false);

  async function guardar(event) {
    event.preventDefault();

    const validacion = parseProfileForm({
      nombre,
    });

    if (!validacion.success) {
      setError(validacion.errors.nombre);

      return;
    }

    setGuardando(true);

    try {
      const actualizado = await configurationService.actualizarPerfil(
        validacion.data,
      );

      await Swal.fire({
        icon: "success",
        title: "Perfil actualizado",
        timer: 1300,
        showConfirmButton: false,
      });

      onUpdated?.(actualizado);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo actualizar el perfil",
        text: error.message,
      });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-2 border-b border-slate-100 pb-4 text-lg font-black text-slate-800">
        <UserRound size={20} className="text-brand-700" />
        Mi perfil
      </h2>

      <form onSubmit={guardar} className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
            Nombre completo
          </label>

          <input
            type="text"
            value={nombre}
            onChange={(event) => {
              setNombre(event.target.value);

              setError("");
            }}
            disabled={guardando}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm font-bold text-slate-800 outline-none focus:border-brand-700"
          />

          {error && (
            <p className="mt-1 text-xs font-bold text-red-600">{error}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
            Correo
          </label>

          <input
            type="email"
            value={perfil.email}
            disabled
            className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 p-3 text-sm font-semibold text-slate-500"
          />

          <p className="mt-1 text-[10px] text-slate-400">
            El correo se modifica desde Administración de Usuarios.
          </p>
        </div>

        <button
          type="submit"
          disabled={guardando}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-brand-800 disabled:opacity-50"
        >
          <Save size={15} />

          {guardando ? "Guardando..." : "Guardar nombre"}
        </button>
      </form>
    </section>
  );
}
