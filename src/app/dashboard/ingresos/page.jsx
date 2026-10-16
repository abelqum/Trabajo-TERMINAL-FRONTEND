"use client";

import { useEffect, useState } from "react";

import { CircleDollarSign, Download, Plus } from "lucide-react";

import Swal from "sweetalert2";

import Pagination from "@/components/common/Pagination";

import IncomeFilters, {
  DEFAULT_INCOME_FILTERS,
} from "@/components/incomes/IncomeFilters";

import IncomeFormModal from "@/components/incomes/IncomeFormModal";
import IncomeSummary from "@/components/incomes/IncomeSummary";
import IncomesTable from "@/components/incomes/IncomesTable";

import { ApiError } from "@/lib/api/apiClient";

import { generarReporteIngresos } from "@/lib/reports/incomesReport";

import { incomesService } from "@/services/incomesService";

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

const RESUMEN_INICIAL = {
  totalCobrado: 0,
  totalPendiente: 0,
  totalCancelado: 0,
  cantidadRegistros: 0,
  cantidadPagados: 0,
  cantidadPendientes: 0,
  cantidadCancelados: 0,
};

export default function IngresosPage() {
  const [pagina, setPagina] = useState(PAGINA_INICIAL);

  const [resumen, setResumen] = useState(RESUMEN_INICIAL);

  const [clientes, setClientes] = useState([]);

  const [filtrosAplicados, setFiltrosAplicados] = useState(
    DEFAULT_INCOME_FILTERS,
  );

  const [paginaActual, setPaginaActual] = useState(0);

  const [cargando, setCargando] = useState(true);

  const [generandoReporte, setGenerandoReporte] = useState(false);

  const [modalAbierto, setModalAbierto] = useState(false);

  const [ingresoSeleccionado, setIngresoSeleccionado] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function cargarIngresos() {
      try {
        const [paginaResponse, resumenResponse] = await Promise.all([
          incomesService.obtenerIngresos({
            page: paginaActual,

            size: ITEMS_POR_PAGINA,

            filtros: filtrosAplicados,

            signal: controller.signal,
          }),

          incomesService.obtenerResumen({
            filtros: filtrosAplicados,

            signal: controller.signal,
          }),
        ]);

        if (controller.signal.aborted) {
          return;
        }

        setPagina(paginaResponse);

        setResumen(resumenResponse);
      } catch (error) {
        if (error.name === "AbortError" || controller.signal.aborted) {
          return;
        }

        console.error("Error cargando ingresos:", error);

        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          return;
        }

        await Swal.fire({
          icon: "error",

          title: "No se pudieron cargar los ingresos",

          text:
            error.message ||
            "No fue posible consultar la información del servidor.",

          confirmButtonText: "Aceptar",

          confirmButtonColor: "#dc2626",
        });
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargarIngresos();

    return () => {
      controller.abort();
    };
  }, [paginaActual, filtrosAplicados]);

  useEffect(() => {
    const controller = new AbortController();

    async function cargarClientes() {
      try {
        const response = await incomesService.obtenerOpcionesClientes({
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setClientes(response);
      } catch (error) {
        if (error.name === "AbortError" || controller.signal.aborted) {
          return;
        }

        console.error("Error cargando opciones de clientes:", error);
      }
    }

    cargarClientes();

    return () => {
      controller.abort();
    };
  }, []);

  function abrirNuevoIngreso() {
    setIngresoSeleccionado(null);

    setModalAbierto(true);
  }

  function abrirEditarIngreso(ingreso) {
    setIngresoSeleccionado(ingreso);

    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);

    setIngresoSeleccionado(null);
  }

  function aplicarFiltros(nuevosFiltros) {
    setCargando(true);

    setPaginaActual(0);

    setFiltrosAplicados(nuevosFiltros);
  }

  function cambiarPagina(nuevaPagina) {
    setCargando(true);

    setPaginaActual(nuevaPagina);
  }

  async function recargarDatos() {
    setCargando(true);

    try {
      let paginaConsulta = paginaActual;

      let [paginaResponse, resumenResponse] = await Promise.all([
        incomesService.obtenerIngresos({
          page: paginaConsulta,

          size: ITEMS_POR_PAGINA,

          filtros: filtrosAplicados,
        }),

        incomesService.obtenerResumen({
          filtros: filtrosAplicados,
        }),
      ]);

      if (paginaResponse.content.length === 0 && paginaConsulta > 0) {
        paginaConsulta -= 1;

        paginaResponse = await incomesService.obtenerIngresos({
          page: paginaConsulta,

          size: ITEMS_POR_PAGINA,

          filtros: filtrosAplicados,
        });

        setPaginaActual(paginaConsulta);
      }

      setPagina(paginaResponse);

      setResumen(resumenResponse);
    } catch (error) {
      console.error("Error recargando ingresos:", error);

      await Swal.fire({
        icon: "error",

        title: "No se pudo actualizar la información",

        text: error.message || "Ocurrió un error al consultar los ingresos.",
      });
    } finally {
      setCargando(false);
    }
  }

  async function ingresoGuardado() {
    cerrarModal();

    await recargarDatos();
  }

  async function eliminarIngreso(ingreso) {
    const identificador = ingreso.folio || ingreso.concepto || `#${ingreso.id}`;

    const confirmacion = await Swal.fire({
      icon: "warning",

      title: "¿Eliminar ingreso?",

      text: `Se eliminará el registro ${identificador}. Esta acción no se puede deshacer.`,

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
      await incomesService.eliminarIngreso(ingreso.id);

      await Swal.fire({
        icon: "success",

        title: "Ingreso eliminado",

        timer: 1400,

        showConfirmButton: false,
      });

      await recargarDatos();
    } catch (error) {
      console.error("Error eliminando ingreso:", error);

      await Swal.fire({
        icon: "error",

        title: "No se pudo eliminar",

        text: error.message || "Ocurrió un error eliminando el registro.",

        confirmButtonColor: "#dc2626",
      });
    }
  }

  function construirDescripcionFiltros() {
    const descripcion = [];

    if (filtrosAplicados.search) {
      descripcion.push(`Búsqueda: ${filtrosAplicados.search}`);
    }

    if (filtrosAplicados.clienteId) {
      const cliente = clientes.find(
        (elemento) =>
          String(elemento.id) === String(filtrosAplicados.clienteId),
      );

      if (cliente) {
        descripcion.push(`Cliente: ${cliente.razonSocial}`);
      }
    }

    if (filtrosAplicados.tipoRegistro) {
      descripcion.push(
        `Tipo: ${
          filtrosAplicados.tipoRegistro === "FACTURA" ? "Factura" : "Ingreso"
        }`,
      );
    }

    if (filtrosAplicados.estado) {
      descripcion.push(`Estado: ${filtrosAplicados.estado}`);
    }

    if (filtrosAplicados.fechaDesde) {
      descripcion.push(`Desde: ${filtrosAplicados.fechaDesde}`);
    }

    if (filtrosAplicados.fechaHasta) {
      descripcion.push(`Hasta: ${filtrosAplicados.fechaHasta}`);
    }

    return descripcion;
  }

  async function generarReporte() {
    setGenerandoReporte(true);

    try {
      const datos = await incomesService.obtenerDatosReporte({
        filtros: filtrosAplicados,
      });

      if (datos.registros.length === 0) {
        await Swal.fire({
          icon: "info",

          title: "Sin información",

          text: "No existen ingresos para generar el reporte con los filtros seleccionados.",
        });

        return;
      }

      generarReporteIngresos({
        registros: datos.registros,

        resumen: datos.resumen,

        descripcionFiltros: construirDescripcionFiltros(),
      });
    } catch (error) {
      console.error("Error generando reporte:", error);

      await Swal.fire({
        icon: "error",

        title: "No se pudo generar el reporte",

        text:
          error.message || "No fue posible obtener la información necesaria.",
      });
    } finally {
      setGenerandoReporte(false);
    }
  }

  return (
    <>
      <div className="mx-auto max-w-[95rem] space-y-6 pb-10">
        <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black text-slate-800">
              <CircleDollarSign className="text-brand-700" />
              Ingresos
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Registra y administra facturas e ingresos de clientes.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={generarReporte}
              disabled={generandoReporte}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generandoReporte ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-700" />
              ) : (
                <Download size={16} />
              )}
              Reporte PDF
            </button>

            <button
              type="button"
              onClick={abrirNuevoIngreso}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:bg-brand-800 active:scale-[0.98]"
            >
              <Plus size={17} />
              Nuevo ingreso
            </button>
          </div>
        </header>

        <IncomeSummary resumen={resumen} />

        <IncomeFilters clientes={clientes} onAplicar={aplicarFiltros} />

        <section className="flex min-h-[50vh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex-1">
            <IncomesTable
              ingresos={pagina.content}
              cargando={cargando}
              onEditar={abrirEditarIngreso}
              onEliminar={eliminarIngreso}
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
        <IncomeFormModal
          key={ingresoSeleccionado?.id ?? "nuevo-ingreso"}
          ingreso={ingresoSeleccionado}
          clientes={clientes}
          onClose={cerrarModal}
          onSaved={ingresoGuardado}
        />
      )}
    </>
  );
}
