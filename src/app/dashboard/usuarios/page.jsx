"use client";

import { useEffect, useState } from "react";

import { Filter, Plus, Search, ShieldCheck, Users } from "lucide-react";

import Swal from "sweetalert2";

import Pagination from "@/components/common/Pagination";

import ResetPasswordModal from "@/components/users/ResetPasswordModal";
import UserFormModal from "@/components/users/UserFormModal";
import UsersTable from "@/components/users/UsersTable";

import { ApiError } from "@/lib/api/apiClient";

import { usersService } from "@/services/usersService";

const ITEMS_POR_PAGINA = 10;

const PAGINA_INICIAL = {
  content: [],
  number: 0,
  size: ITEMS_POR_PAGINA,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,

  permisos: {
    crearUsuario: false,
  },
};

export default function UsuariosPage() {
  const [pagina, setPagina] = useState(PAGINA_INICIAL);

  const [search, setSearch] = useState("");

  const [rol, setRol] = useState("");

  const [paginaActual, setPaginaActual] = useState(0);

  const [cargando, setCargando] = useState(true);

  const [recarga, setRecarga] = useState(0);

  const [modalUsuario, setModalUsuario] = useState(false);

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const [usuarioPassword, setUsuarioPassword] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        const response = await usersService.obtenerUsuarios({
          page: paginaActual,

          size: ITEMS_POR_PAGINA,

          search,

          rol,

          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setPagina(response);
      } catch (error) {
        if (error.name === "AbortError" || controller.signal.aborted) {
          return;
        }

        console.error("Error cargando usuarios:", error);

        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          return;
        }

        await Swal.fire({
          icon: "error",

          title: "No se pudieron cargar los usuarios",

          text: error.message || "Ocurrió un error consultando las cuentas.",
        });
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timeout);

      controller.abort();
    };
  }, [paginaActual, search, rol, recarga]);

  function nuevoUsuario() {
    setUsuarioSeleccionado(null);

    setModalUsuario(true);
  }

  function editarUsuario(usuario) {
    setUsuarioSeleccionado(usuario);

    setModalUsuario(true);
  }

  function cerrarUsuario() {
    setModalUsuario(false);

    setUsuarioSeleccionado(null);
  }

  function usuarioGuardado() {
    cerrarUsuario();

    setCargando(true);

    setRecarga((actual) => actual + 1);
  }

  async function eliminarUsuario(usuario) {
    const confirmacion = await Swal.fire({
      icon: "warning",

      title: "¿Eliminar usuario?",

      text: `Se eliminará la cuenta de ${usuario.nombre}. Esta acción no se puede deshacer.`,

      showCancelButton: true,

      confirmButtonText: "Sí, eliminar",

      cancelButtonText: "Cancelar",

      confirmButtonColor: "#dc2626",

      cancelButtonColor: "#64748b",

      reverseButtons: true,
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    try {
      await usersService.eliminarUsuario(usuario.id);

      await Swal.fire({
        icon: "success",

        title: "Usuario eliminado",

        timer: 1300,

        showConfirmButton: false,
      });

      if (pagina.content.length === 1 && paginaActual > 0) {
        setPaginaActual((actual) => actual - 1);

        setCargando(true);

        return;
      }

      setCargando(true);

      setRecarga((actual) => actual + 1);
    } catch (error) {
      let mensaje = error.message || "No fue posible eliminar la cuenta.";

      if (error instanceof ApiError && error.status === 409) {
        mensaje =
          "El usuario no puede eliminarse. Puede ser tu propia cuenta, el último administrador o tener información que deba conservarse.";
      }

      await Swal.fire({
        icon: "error",

        title: "No se pudo eliminar",

        text: mensaje,

        confirmButtonColor: "#dc2626",
      });
    }
  }

  return (
    <>
      <div className="mx-auto max-w-[90rem] space-y-6 pb-12">
        <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black text-slate-800">
              <Users className="text-brand-700" />
              Gestión de Usuarios
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Administra las cuentas, accesos y roles del equipo de trabajo.
            </p>
          </div>

          {pagina.permisos.crearUsuario && (
            <button
              type="button"
              onClick={nuevoUsuario}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-md transition hover:bg-brand-800"
            >
              <Plus size={16} />
              Nuevo usuario
            </button>
          )}
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
            <Users className="text-brand-700" />

            <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-brand-600">
              Usuarios encontrados
            </p>

            <p className="mt-1 text-2xl font-black text-brand-950">
              {pagina.totalElements}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:col-span-2">
            <div className="flex items-start gap-3">
              <ShieldCheck className="shrink-0 text-emerald-600" />

              <div>
                <p className="text-sm font-black text-slate-800">
                  Administración restringida
                </p>

                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Solo los administradores pueden consultar o modificar las
                  cuentas del sistema.
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);

                setPaginaActual(0);

                setCargando(true);
              }}
              placeholder="Buscar por nombre o correo..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10"
            />
          </div>

          <div className="relative sm:w-56">
            <Filter
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={rol}
              onChange={(event) => {
                setRol(event.target.value);

                setPaginaActual(0);

                setCargando(true);
              }}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-9 pr-3 text-sm font-bold text-slate-700 outline-none focus:border-brand-700"
            >
              <option value="">Todos los roles</option>

              <option value="admin">Administradores</option>

              <option value="editor">Editores</option>

              <option value="empleado">Empleados</option>
            </select>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <UsersTable
            usuarios={pagina.content}
            cargando={cargando}
            onEditar={editarUsuario}
            onPassword={setUsuarioPassword}
            onEliminar={eliminarUsuario}
          />

          {!cargando && (
            <Pagination
              page={pagina.number}
              totalPages={pagina.totalPages}
              totalElements={pagina.totalElements}
              onPageChange={(nuevaPagina) => {
                setPaginaActual(nuevaPagina);

                setCargando(true);
              }}
            />
          )}
        </section>
      </div>

      {modalUsuario && (
        <UserFormModal
          key={usuarioSeleccionado?.id ?? "nuevo-usuario"}
          usuario={usuarioSeleccionado}
          onClose={cerrarUsuario}
          onSaved={usuarioGuardado}
        />
      )}

      {usuarioPassword && (
        <ResetPasswordModal
          key={usuarioPassword.id}
          usuario={usuarioPassword}
          onClose={() => setUsuarioPassword(null)}
        />
      )}
    </>
  );
}
