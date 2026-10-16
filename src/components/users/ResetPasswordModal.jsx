"use client";

import { useState } from "react";

import { KeyRound, Save, X } from "lucide-react";

import Swal from "sweetalert2";

import { usersService } from "@/services/usersService";

import { parsePasswordForm } from "@/validations/userSchema";

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10";

export default function ResetPasswordModal({ usuario, onClose }) {
  const [form, setForm] = useState({
    password: "",
    confirmarPassword: "",
  });

  const [errors, setErrors] = useState({});

  const [guardando, setGuardando] = useState(false);

  function actualizar(campo, valor) {
    setForm((actual) => ({
      ...actual,
      [campo]: valor,
    }));

    if (errors[campo]) {
      setErrors((actual) => {
        const nuevos = {
          ...actual,
        };

        delete nuevos[campo];

        return nuevos;
      });
    }
  }

  async function guardar(event) {
    event.preventDefault();

    const validacion = parsePasswordForm(form);

    if (!validacion.success) {
      setErrors(validacion.errors);

      return;
    }

    setGuardando(true);

    try {
      await usersService.restablecerPassword(
        usuario.id,
        validacion.data.password,
      );

      await Swal.fire({
        icon: "success",

        title: "Contraseña actualizada",

        text: `La contraseña de ${usuario.nombre} fue restablecida.`,

        timer: 1600,

        showConfirmButton: false,
      });

      onClose();
    } catch (error) {
      await Swal.fire({
        icon: "error",

        title: "No se pudo cambiar la contraseña",

        text: error.message || "Ocurrió un error inesperado.",
      });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !guardando) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700">
              <KeyRound size={20} />
            </div>

            <div>
              <h2 className="font-black text-slate-800">
                Restablecer contraseña
              </h2>

              <p className="mt-1 text-xs text-slate-500">{usuario.nombre}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200"
          >
            <X size={19} />
          </button>
        </header>

        <form id="password-form" onSubmit={guardar} className="space-y-5 p-6">
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
              Nueva contraseña
            </label>

            <input
              type="password"
              value={form.password}
              onChange={(event) => actualizar("password", event.target.value)}
              autoComplete="new-password"
              className={INPUT_CLASS}
            />

            {errors.password && (
              <p className="mt-1 text-xs font-bold text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
              Confirmar contraseña
            </label>

            <input
              type="password"
              value={form.confirmarPassword}
              onChange={(event) =>
                actualizar("confirmarPassword", event.target.value)
              }
              autoComplete="new-password"
              className={INPUT_CLASS}
            />

            {errors.confirmarPassword && (
              <p className="mt-1 text-xs font-bold text-red-600">
                {errors.confirmarPassword}
              </p>
            )}
          </div>
        </form>

        <footer className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-black text-slate-600"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="password-form"
            disabled={guardando}
            className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-xs font-black text-white hover:bg-amber-700 disabled:opacity-50"
          >
            <Save size={15} />

            {guardando ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </footer>
      </div>
    </div>
  );
}
