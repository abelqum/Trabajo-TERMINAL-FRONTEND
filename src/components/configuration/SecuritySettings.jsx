"use client";

import { useState } from "react";

import { Eye, EyeOff, KeyRound, Save } from "lucide-react";

import Swal from "sweetalert2";

import { configurationService } from "@/services/configurationService";

import { parsePasswordChange } from "@/validations/configurationSchema";

const ESTADO_INICIAL = {
  passwordActual: "",
  nuevaPassword: "",
  confirmarPassword: "",
};

export default function SecuritySettings() {
  const [form, setForm] = useState(ESTADO_INICIAL);

  const [errors, setErrors] = useState({});

  const [mostrarPasswords, setMostrarPasswords] = useState(false);

  const [guardando, setGuardando] = useState(false);

  function actualizar(campo, valor) {
    setForm((actual) => ({
      ...actual,
      [campo]: valor,
    }));

    setErrors((actual) => {
      const nuevos = {
        ...actual,
      };

      delete nuevos[campo];

      return nuevos;
    });
  }

  async function guardar(event) {
    event.preventDefault();

    const validacion = parsePasswordChange(form);

    if (!validacion.success) {
      setErrors(validacion.errors);

      return;
    }

    setGuardando(true);

    try {
      await configurationService.cambiarPassword(validacion.data);

      setForm(ESTADO_INICIAL);

      await Swal.fire({
        icon: "success",
        title: "Contraseña actualizada",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo cambiar la contraseña",
        text: error.message,
      });
    } finally {
      setGuardando(false);
    }
  }

  const tipo = mostrarPasswords ? "text" : "password";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-2 border-b border-slate-100 pb-4 text-lg font-black text-slate-800">
        <KeyRound size={20} className="text-brand-700" />
        Seguridad
      </h2>

      <form onSubmit={guardar} className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
            Contraseña actual
          </label>

          <input
            type={tipo}
            value={form.passwordActual}
            onChange={(event) =>
              actualizar("passwordActual", event.target.value)
            }
            className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm font-bold outline-none focus:border-brand-700"
          />

          {errors.passwordActual && (
            <p className="mt-1 text-xs font-bold text-red-600">
              {errors.passwordActual}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
            Nueva contraseña
          </label>

          <input
            type={tipo}
            value={form.nuevaPassword}
            onChange={(event) =>
              actualizar("nuevaPassword", event.target.value)
            }
            className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm font-bold outline-none focus:border-brand-700"
          />

          {errors.nuevaPassword && (
            <p className="mt-1 text-xs font-bold text-red-600">
              {errors.nuevaPassword}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
            Confirmar contraseña
          </label>

          <div className="relative">
            <input
              type={tipo}
              value={form.confirmarPassword}
              onChange={(event) =>
                actualizar("confirmarPassword", event.target.value)
              }
              className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 pr-11 text-sm font-bold outline-none focus:border-brand-700"
            />

            <button
              type="button"
              onClick={() => setMostrarPasswords((actual) => !actual)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {mostrarPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errors.confirmarPassword && (
            <p className="mt-1 text-xs font-bold text-red-600">
              {errors.confirmarPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={guardando}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 py-3 text-xs font-black uppercase tracking-wider text-white transition disabled:opacity-50"
        >
          <Save size={15} />

          {guardando ? "Actualizando..." : "Cambiar contraseña"}
        </button>
      </form>
    </section>
  );
}
