"use client";

import {
  Edit2,
  KeyRound,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";

import { obtenerNombreRol } from "@/validations/userSchema";

function obtenerEstiloRol(rol) {
  switch (rol) {
    case "admin":
      return {
        clase: "border-brand-200 bg-brand-50 text-brand-700",

        icono: ShieldCheck,
      };

    case "editor":
      return {
        clase: "border-violet-200 bg-violet-50 text-violet-700",

        icono: UserRound,
      };

    default:
      return {
        clase: "border-slate-200 bg-slate-100 text-slate-600",

        icono: Users,
      };
  }
}

export default function UsersTable({
  usuarios,
  cargando,
  onEditar,
  onPassword,
  onEliminar,
}) {
  if (cargando) {
    return (
      <div className="flex min-h-[430px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-700 border-t-transparent" />
      </div>
    );
  }

  if (!usuarios.length) {
    return (
      <div className="flex min-h-[430px] items-center justify-center">
        <div className="text-center">
          <Users size={42} className="mx-auto text-slate-300" />

          <p className="mt-4 font-black text-slate-600">
            No se encontraron usuarios
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] text-left">
        <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <tr>
            <th className="p-4">Usuario</th>

            <th className="p-4">Correo</th>

            <th className="p-4 text-center">Rol</th>

            <th className="p-4 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {usuarios.map((usuario) => {
            const rol = obtenerEstiloRol(usuario.rol);

            const RolIcono = rol.icono;

            return (
              <tr key={usuario.id} className="transition hover:bg-slate-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-600">
                      {usuario.nombre?.charAt(0).toUpperCase() || "U"}
                    </div>

                    <div>
                      <p className="font-black text-slate-800">
                        {usuario.nombre}
                      </p>

                      <p className="mt-0.5 text-[10px] font-mono text-slate-400">
                        ID: {usuario.id}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="p-4 text-sm font-semibold text-slate-600">
                  {usuario.email}
                </td>

                <td className="p-4 text-center">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${rol.clase}`}
                  >
                    <RolIcono size={13} />

                    {obtenerNombreRol(usuario.rol)}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex justify-center gap-1">
                    {usuario.permisos.editar && (
                      <button
                        type="button"
                        title="Editar usuario"
                        onClick={() => onEditar(usuario)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-brand-50 hover:text-brand-700"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}

                    {usuario.permisos.restablecerPassword && (
                      <button
                        type="button"
                        title="Restablecer contraseña"
                        onClick={() => onPassword(usuario)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-amber-50 hover:text-amber-700"
                      >
                        <KeyRound size={16} />
                      </button>
                    )}

                    {usuario.permisos.eliminar && (
                      <button
                        type="button"
                        title="Eliminar usuario"
                        onClick={() => onEliminar(usuario)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
