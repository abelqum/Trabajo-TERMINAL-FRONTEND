"use client";

import { useState } from "react";

import { Save, ShieldCheck, UserPlus, X } from "lucide-react";

import Swal from "sweetalert2";

import { ApiError } from "@/lib/api/apiClient";

import { usersService } from "@/services/usersService";

import {
  crearEstadoInicialUsuario,
  parseUserForm,
  USER_ROLES,
} from "@/validations/userSchema";

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10 disabled:cursor-not-allowed disabled:opacity-60";

export default function UserFormModal({ usuario = null, onClose, onSaved }) {
  const [form, setForm] = useState(() => crearEstadoInicialUsuario(usuario));

  const [errors, setErrors] = useState({});

  const [guardando, setGuardando] = useState(false);

  const editando = Boolean(usuario?.id);

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

    const validacion = parseUserForm(form, {
      editando,
    });

    if (!validacion.success) {
      setErrors(validacion.errors);

      return;
    }

    setGuardando(true);

    try {
      if (editando) {
        await usersService.actualizarUsuario(usuario.id, validacion.data);
      } else {
        await usersService.crearUsuario(validacion.data);
      }

      await Swal.fire({
        icon: "success",

        title: editando ? "Usuario actualizado" : "Usuario registrado",

        text: editando
          ? "Los cambios se guardaron correctamente."
          : "La cuenta ya puede utilizar el sistema.",

        timer: 1600,

        showConfirmButton: false,
      });

      onSaved();
    } catch (error) {
      console.error("Error guardando usuario:", error);

      let titulo = "No se pudo guardar el usuario";

      let mensaje = error.message || "Ocurrió un error inesperado.";

      if (error instanceof ApiError && error.status === 409) {
        titulo = "Correo no disponible";

        mensaje =
          "Ya existe un usuario registrado con ese correo o la modificación no está permitida.";
      }

      await Swal.fire({
        icon: "error",
        title: titulo,
        text: mensaje,

        confirmButtonColor: "#dc2626",
      });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !guardando) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-brand-100 p-2.5 text-brand-700">
              {editando ? <ShieldCheck size={21} /> : <UserPlus size={21} />}
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-800">
                {editando ? "Editar usuario" : "Nuevo usuario"}
              </h2>

              <p className="mt-1 text-xs font-medium text-slate-500">
                {editando
                  ? "Modifica los datos y permisos de la cuenta."
                  : "Crea una nueva cuenta para el equipo."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </header>

        <form id="user-form" onSubmit={guardar} className="space-y-5 p-6">
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
              Nombre completo *
            </label>

            <input
              type="text"
              value={form.nombre}
              onChange={(event) => actualizar("nombre", event.target.value)}
              disabled={guardando}
              placeholder="Ej. Juan Pérez"
              autoComplete="off"
              className={INPUT_CLASS}
            />

            {errors.nombre && (
              <p className="mt-1.5 text-xs font-bold text-red-600">
                {errors.nombre}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
              Correo electrónico *
            </label>

            <input
              type="email"
              value={form.email}
              onChange={(event) => actualizar("email", event.target.value)}
              disabled={guardando}
              placeholder="usuario@empresa.com"
              autoComplete="off"
              className={INPUT_CLASS}
            />

            {errors.email && (
              <p className="mt-1.5 text-xs font-bold text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          {!editando && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Contraseña *
                </label>

                <input
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    actualizar("password", event.target.value)
                  }
                  disabled={guardando}
                  autoComplete="new-password"
                  className={INPUT_CLASS}
                />

                {errors.password && (
                  <p className="mt-1.5 text-xs font-bold text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Confirmar contraseña *
                </label>

                <input
                  type="password"
                  value={form.confirmarPassword}
                  onChange={(event) =>
                    actualizar("confirmarPassword", event.target.value)
                  }
                  disabled={guardando}
                  autoComplete="new-password"
                  className={INPUT_CLASS}
                />

                {errors.confirmarPassword && (
                  <p className="mt-1.5 text-xs font-bold text-red-600">
                    {errors.confirmarPassword}
                  </p>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
              Rol *
            </label>

            <div className="grid grid-cols-1 gap-2">
              {USER_ROLES.map((rol) => {
                const activo = form.rol === rol.value;

                return (
                  <label
                    key={rol.value}
                    className={`cursor-pointer rounded-xl border p-4 transition ${
                      activo
                        ? "border-brand-400 bg-brand-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="rol"
                        value={rol.value}
                        checked={activo}
                        onChange={() => actualizar("rol", rol.value)}
                        disabled={
                          guardando ||
                          (editando && !usuario?.permisos?.cambiarRol)
                        }
                        className="h-4 w-4 accent-brand-700"
                      />

                      <div>
                        <p className="text-sm font-black text-slate-800">
                          {rol.label}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {rol.description}
                        </p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </form>

        <footer className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="user-form"
            disabled={guardando}
            className="flex items-center gap-2 rounded-xl bg-brand-700 px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:bg-brand-800 disabled:opacity-50"
          >
            {guardando ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Save size={16} />
            )}

            {guardando
              ? "Guardando..."
              : editando
                ? "Guardar cambios"
                : "Crear usuario"}
          </button>
        </footer>
      </div>
    </div>
  );
}
