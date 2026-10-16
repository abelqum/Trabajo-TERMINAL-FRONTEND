"use client";

import { LogOut, Menu } from "lucide-react";

import ReportProblemButton from "@/components/dashboard/ReportProblemButton";

function obtenerNombreRol(rol) {
  switch (
    String(rol || "")
      .trim()
      .toLowerCase()
  ) {
    case "admin":
      return "Administrador";

    case "editor":
      return "Editor";

    case "empleado":
      return "Empleado";

    default:
      return "Usuario";
  }
}

function obtenerInicial(usuario) {
  const nombre = usuario?.nombre?.trim() || usuario?.email?.trim() || "Usuario";

  return nombre.charAt(0).toUpperCase();
}

export default function DashboardHeader({
  titulo,
  usuario,
  onAbrirMenu,
  onCerrarSesion,
}) {
  const nombre = usuario?.nombre?.trim() || usuario?.email?.trim() || "Usuario";

  const inicial = obtenerInicial(usuario);

  const rol = obtenerNombreRol(usuario?.rol);

  return (
    <header
      className="
        sticky top-0 z-30
        flex h-18 shrink-0
        items-center justify-between

        border-b border-slate-200

        bg-white/95

        px-4

        shadow-sm
        backdrop-blur

        md:px-7
      "
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onAbrirMenu}
          aria-label="Abrir menú"
          className="
            rounded-xl
            border border-slate-200
            bg-white
            p-2.5
            text-slate-600
            transition

            hover:border-brand-300
            hover:bg-brand-50
            hover:text-brand-700

            lg:hidden
          "
        >
          <Menu size={21} aria-hidden="true" />
        </button>

        <div className="min-w-0">
          <h1
            className="
              truncate
              text-base
              font-black
              text-brand-950

              md:text-lg
            "
          >
            {titulo}
          </h1>

          <p
            className="
              hidden
              text-[10px]
              font-bold
              uppercase
              tracking-widest
              text-slate-400

              sm:block
            "
          >
            Sistema de Gestión para Microempresas
          </p>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        <ReportProblemButton />

        <div
          className="
            hidden
            min-w-0
            text-right

            sm:block
          "
        >
          <p
            className="
              max-w-60
              truncate
              text-sm
              font-bold
              text-slate-700
            "
          >
            {nombre}
          </p>

          <div className="mt-1 flex justify-end">
            <span
              className="
                inline-flex
                items-center

                rounded-full

                border
                border-brand-200

                bg-brand-50

                px-2.5
                py-0.5

                text-[9px]
                font-black
                uppercase
                tracking-[0.12em]

                text-brand-700
              "
            >
              {rol}
            </span>
          </div>
        </div>

        <div
          className="
            flex
            h-11 w-11
            shrink-0
            items-center
            justify-center

            rounded-full

            border-2
            border-brand-200

            bg-brand-100

            font-black
            text-brand-700

            shadow-sm
          "
          title={`${nombre} — ${rol}`}
        >
          {inicial}
        </div>

        <button
          type="button"
          onClick={onCerrarSesion}
          className="
            hidden
            items-center
            gap-2

            rounded-xl

            border
            border-red-100

            bg-red-50

            px-4
            py-2.5

            text-xs
            font-black
            uppercase
            tracking-widest

            text-red-700

            transition

            hover:border-red-200
            hover:bg-red-100

            md:flex
          "
        >
          <LogOut size={15} aria-hidden="true" />
          Salir
        </button>
      </div>
    </header>
  );
}
