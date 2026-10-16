"use client";

import Link from "next/link";

import {
  Boxes,
  Building2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Home,
  LogOut,
  ReceiptText,
  Settings,
  Truck,
  UserRound,
  Users,
  X,
} from "lucide-react";

const LINKS = [
  {
    nombre: "Inicio",
    href: "/dashboard",
    icono: Home,
    roles: ["admin", "editor", "empleado"],
  },
  {
    nombre: "Tareas",
    href: "/dashboard/tareas",
    icono: CheckSquare,
    roles: ["admin", "editor", "empleado"],
  },
  {
    nombre: "Inventario",
    href: "/dashboard/inventario",
    icono: Boxes,
    roles: ["admin", "empleado"],
  },
  {
    nombre: "Ingresos",
    href: "/dashboard/ingresos",
    icono: CircleDollarSign,
    roles: ["admin", "editor"],
  },
  {
    nombre: "Egresos",
    href: "/dashboard/egresos",
    icono: ReceiptText,
    roles: ["admin", "editor"],
  },
  {
    nombre: "Viáticos",
    href: "/dashboard/viaticos",
    icono: Truck,
    roles: ["admin", "empleado"],
  },
  {
    nombre: "Clientes",
    href: "/dashboard/clientes",
    icono: UserRound,
    roles: ["admin", "editor"],
  },
  {
    nombre: "Usuarios",
    href: "/dashboard/usuarios",
    icono: Users,
    roles: ["admin"],
  },
  {
    nombre: "Configuración",
    href: "/dashboard/configuracion",
    icono: Settings,
    roles: ["admin", "empleado"],
  },
];

export function obtenerLinksPermitidos(rol) {
  if (!rol) {
    return [];
  }

  return LINKS.filter((link) => link.roles.includes(rol));
}

export function obtenerTituloRuta(pathname, rol) {
  const links = obtenerLinksPermitidos(rol);

  const coincidenciaExacta = links.find((link) => link.href === pathname);

  if (coincidenciaExacta) {
    return coincidenciaExacta.nombre;
  }

  const coincidenciaParcial = links.find(
    (link) =>
      link.href !== "/dashboard" && pathname.startsWith(`${link.href}/`),
  );

  return coincidenciaParcial?.nombre ?? "Panel";
}

export function rutaPermitida(pathname, rol) {
  if (!rol) {
    return false;
  }

  return LINKS.some((link) => {
    const coincide =
      pathname === link.href ||
      (link.href !== "/dashboard" && pathname.startsWith(`${link.href}/`));

    return coincide && link.roles.includes(rol);
  });
}

function obtenerIniciales(nombre) {
  if (!nombre || !nombre.trim()) {
    return "SG";
  }

  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0))
    .join("")
    .toUpperCase();
}

export default function DashboardSidebar({
  pathname,
  rol,
  empresa,
  abiertoMovil,
  contraido,
  onCerrarMovil,
  onAlternarContraido,
  onCerrarSesion,
}) {
  const linksPermitidos = obtenerLinksPermitidos(rol);

  const nombreEmpresa = empresa?.nombre || "Microempresa";

  const iniciales = obtenerIniciales(nombreEmpresa);

  return (
    <>
      {/* ==============================================
          MOBILE OVERLAY
      ============================================== */}

      {abiertoMovil && (
        <button
          type="button"
          aria-label="Cerrar menú lateral"
          onClick={onCerrarMovil}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ==============================================
          SIDEBAR
      ============================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col
          text-white shadow-2xl
          transition-all duration-300

          bg-[var(--brand-sidebar)]

          lg:sticky
          lg:top-0
          lg:h-screen

          ${
            abiertoMovil
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }

          ${contraido ? "w-72 lg:w-24" : "w-72"}
        `}
      >
        {/* ============================================
            COMPANY / SYSTEM HEADER
        ============================================ */}

        <div
          className={`
            flex min-h-[92px] shrink-0 items-center
            border-b
            border-[var(--brand-sidebar-border)]
            px-4 py-4

            ${
              contraido
                ? "justify-between lg:justify-center"
                : "justify-between"
            }
          `}
        >
          {/* EXPANDED */}

          <div
            className={`
              min-w-0 flex-1
              ${contraido ? "lg:hidden" : ""}
            `}
          >
            <div className="flex min-w-0 items-center gap-3">
              {/* LOGO */}

              <div
                className="
                  flex h-12 w-12 shrink-0
                  items-center justify-center
                  overflow-hidden
                  rounded-xl
                  border border-white/10
                  bg-white/10
                  shadow-sm
                "
              >
                {empresa?.logoUrl ? (
                  <img
                    src={empresa.logoUrl}
                    alt={`Logo de ${nombreEmpresa}`}
                    className="
                      h-full w-full
                      object-contain
                      p-1.5
                    "
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    {iniciales ? (
                      <span className="text-sm font-black tracking-wide text-white">
                        {iniciales}
                      </span>
                    ) : (
                      <Building2 size={23} />
                    )}
                  </div>
                )}
              </div>

              {/* NAMES */}

              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-black leading-tight text-white">
                  Sistema de Gestión
                </h2>

                <p
                  className="
                    mt-1 truncate
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-[0.12em]
                    text-[var(--brand-sidebar-muted)]
                  "
                  title={nombreEmpresa}
                >
                  {nombreEmpresa}
                </p>
              </div>
            </div>
          </div>

          {/* COLLAPSED DESKTOP */}

          {contraido && (
            <div
              className="
                hidden h-12 w-12
                items-center justify-center
                overflow-hidden
                rounded-xl
                border border-white/10
                bg-white/10
                lg:flex
              "
              title={nombreEmpresa}
            >
              {empresa?.logoUrl ? (
                <img
                  src={empresa.logoUrl}
                  alt={`Logo de ${nombreEmpresa}`}
                  className="
                    h-full w-full
                    object-contain
                    p-1.5
                  "
                />
              ) : (
                <span className="text-sm font-black text-white">
                  {iniciales}
                </span>
              )}
            </div>
          )}

          {/* MOBILE CLOSE */}

          <button
            type="button"
            onClick={onCerrarMovil}
            aria-label="Cerrar menú"
            className="
              ml-3 rounded-xl
              bg-white/10
              p-2
              text-white/70
              transition
              hover:bg-white/20
              hover:text-white
              lg:hidden
            "
          >
            <X size={21} />
          </button>
        </div>

        {/* ============================================
            NAVIGATION
        ============================================ */}

        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-5">
          {linksPermitidos.map((link) => {
            const Icono = link.icono;

            const activo =
              pathname === link.href ||
              (link.href !== "/dashboard" &&
                pathname.startsWith(`${link.href}/`));

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onCerrarMovil}
                title={contraido ? link.nombre : undefined}
                className={`
                    group
                    flex items-center
                    rounded-xl
                    py-3
                    transition-all

                    ${contraido ? "justify-center px-3" : "gap-3 px-4"}

                    ${
                      activo
                        ? `
                          bg-brand-700
                          text-white
                          shadow-lg
                          shadow-black/15
                        `
                        : `
                          text-white/80
                          hover:bg-[var(--brand-sidebar-hover)]
                          hover:text-white
                        `
                    }
                  `}
              >
                <Icono size={20} className="shrink-0" aria-hidden="true" />

                <span
                  className={`
                      truncate
                      text-sm
                      font-bold

                      ${contraido ? "lg:hidden" : ""}
                    `}
                >
                  {link.nombre}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* ============================================
            LOGOUT
        ============================================ */}

        <div
          className="
            shrink-0
            border-t
            border-[var(--brand-sidebar-border)]
            p-3
          "
        >
          <button
            type="button"
            onClick={onCerrarSesion}
            title={contraido ? "Cerrar sesión" : undefined}
            className={`
              flex w-full
              items-center
              rounded-xl
              py-3
              text-red-200
              transition

              hover:bg-red-500/20
              hover:text-white

              ${contraido ? "justify-center px-3" : "gap-3 px-4"}
            `}
          >
            <LogOut size={20} aria-hidden="true" />

            <span
              className={`
                text-sm font-bold

                ${contraido ? "lg:hidden" : ""}
              `}
            >
              Cerrar sesión
            </span>
          </button>
        </div>

        {/* ============================================
            COLLAPSE BUTTON
        ============================================ */}

        <button
          type="button"
          onClick={onAlternarContraido}
          className="
            absolute
            -right-4
            top-24

            hidden
            h-8 w-8
            items-center
            justify-center

            rounded-full
            border
            border-slate-200

            bg-white
            text-slate-600
            shadow-md

            transition

            hover:border-brand-300
            hover:text-brand-700

            lg:flex
          "
          aria-label={
            contraido ? "Expandir menú lateral" : "Contraer menú lateral"
          }
        >
          {contraido ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
      </aside>
    </>
  );
}
