"use client";

import { useCallback, useEffect, useState } from "react";

import { Plus, Search, Users } from "lucide-react";

import Swal from "sweetalert2";

import ClientFormModal from "@/components/clients/ClientFormModal";
import ClientsTable from "@/components/clients/ClientsTable";
import Pagination from "@/components/common/Pagination";

import { ApiError } from "@/lib/api/apiClient";

import { clientsService } from "@/services/clientsService";

const ITEMS_POR_PAGINA = 10;

const PAGINA_INICIAL = {
  content: [],
  number: 0,
  size: ITEMS_POR_PAGINA,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
};

export default function ClientesPage() {
  const [pagina, setPagina] = useState(PAGINA_INICIAL);

  const [busqueda, setBusqueda] = useState("");

  const [paginaActual, setPaginaActual] = useState(0);

  const [cargando, setCargando] = useState(true);

  const [modalAbierto, setModalAbierto] = useState(false);

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  const cargarClientes = useCallback(async ({ page, search, signal }) => {
    try {
      const resultado = await clientsService.obtenerClientes({
        page,
        size: ITEMS_POR_PAGINA,
        search,
        signal,
      });

      if (signal?.aborted) {
        return;
      }

      setPagina(resultado);
    } catch (error) {
      if (error.name === "AbortError" || signal?.aborted) {
        return;
      }

      console.error("Error cargando clientes:", error);

      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        return;
      }

      await Swal.fire({
        icon: "error",
        title: "No se pudieron cargar los clientes",
        text:
          error.message ||
          "No fue posible obtener la información del servidor.",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      if (!signal?.aborted) {
        setCargando(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const temporizador = setTimeout(() => {
      cargarClientes({
        page: paginaActual,
        search: busqueda,
        signal: controller.signal,
      });
    }, 350);

    return () => {
      clearTimeout(temporizador);

      controller.abort();
    };
  }, [busqueda, paginaActual, cargarClientes]);

  function abrirNuevoCliente() {
    setClienteSeleccionado(null);
    setModalAbierto(true);
  }

  function abrirEditarCliente(cliente) {
    setClienteSeleccionado(cliente);

    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);

    setClienteSeleccionado(null);
  }

  function cambiarBusqueda(event) {
    setBusqueda(event.target.value);

    setPaginaActual(0);
    setCargando(true);
  }

  function cambiarPagina(nuevaPagina) {
    setPaginaActual(nuevaPagina);

    setCargando(true);
  }

  async function recargarClientes() {
    setCargando(true);

    try {
      const resultado = await clientsService.obtenerClientes({
        page: paginaActual,
        size: ITEMS_POR_PAGINA,
        search: busqueda,
      });

      /*
       * Si eliminamos el último
       * registro de una página,
       * podríamos quedar en una
       * página que ya no existe.
       */
      if (resultado.content.length === 0 && paginaActual > 0) {
        setPaginaActual((actual) => actual - 1);

        return;
      }

      setPagina(resultado);
    } catch (error) {
      console.error("Error recargando clientes:", error);

      await Swal.fire({
        icon: "error",
        title: "No se pudo actualizar la lista",
        text: error.message || "No fue posible consultar los clientes.",
      });
    } finally {
      setCargando(false);
    }
  }

  async function clienteGuardado() {
    cerrarModal();

    await recargarClientes();
  }

  async function eliminarCliente(cliente) {
    const confirmacion = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar cliente?",

      html: `
          <p>
            Se intentará eliminar a
            <strong>${cliente.razonSocial}</strong>.
          </p>

          <p style="margin-top: 8px;">
            Si tiene ingresos, movimientos
            u otro historial relacionado,
            el sistema no permitirá eliminarlo.
          </p>
        `,

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
      await clientsService.eliminarCliente(cliente.id);

      await Swal.fire({
        icon: "success",
        title: "Cliente eliminado",
        timer: 1500,
        showConfirmButton: false,
      });

      await recargarClientes();
    } catch (error) {
      console.error("Error eliminando cliente:", error);

      let titulo = "No se pudo eliminar";

      let mensaje = error.message || "Ocurrió un error eliminando el cliente.";

      if (error instanceof ApiError && error.status === 409) {
        titulo = "Cliente con historial";

        mensaje =
          "El cliente no puede eliminarse porque tiene información relacionada dentro del sistema.";
      }

      await Swal.fire({
        icon: "error",
        title,
        text: mensaje,
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#dc2626",
      });
    }
  }

  return (
    <>
      <div className="mx-auto max-w-[90rem] space-y-6">
        <header className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black text-slate-800">
              <Users className="text-brand-700" />
              Clientes
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Administra los clientes utilizados en los diferentes módulos del
              sistema.
            </p>
          </div>

          <button
            type="button"
            onClick={abrirNuevoCliente}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-md transition-colors hover:bg-brand-800 active:scale-95 sm:w-auto"
          >
            <Plus size={16} />
            Nuevo Cliente
          </button>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="relative ml-auto w-full md:w-96">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={busqueda}
              onChange={cambiarBusqueda}
              placeholder="Buscar por razón social o RFC..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none transition-all focus:border-brand-700 focus:ring-1 focus:ring-brand-700"
            />
          </div>
        </section>

        <section className="flex min-h-[50vh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex-1">
            <ClientsTable
              clientes={pagina.content}
              cargando={cargando}
              onEditar={abrirEditarCliente}
              onEliminar={eliminarCliente}
            />
          </div>

          {!cargando && (
            <Pagination
              page={pagina.number}
              totalPages={pagina.totalPages}
              totalElements={pagina.totalElements}
              onPageChange={cambiarPagina}
            />
          )}
        </section>
      </div>

      {modalAbierto && (
        <ClientFormModal
          cliente={clienteSeleccionado}
          onClose={cerrarModal}
          onSaved={clienteGuardado}
        />
      )}
    </>
  );
}
