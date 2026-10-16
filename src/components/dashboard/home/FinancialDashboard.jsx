"use client";

import { useRef, useState } from "react";

import { Download, TrendingUp } from "lucide-react";

import Swal from "sweetalert2";

import FinancialBarChart from "./FinancialBarChart";
import FinancialSummary from "./FinancialSummary";
import ExpenseCategoriesChart from "./ExpenseCategoriesChart";
import DashboardReportModal from "./DashboardReportModal";

import { dashboardService } from "@/services/dashboardService";

import { generarReporteDashboard } from "@/lib/reports/dashboardReport";

function obtenerPeriodoActual() {
  const fecha = new Date();

  const anio = fecha.getFullYear();

  const mes = String(fecha.getMonth() + 1).padStart(2, "0");

  return `${anio}-${mes}`;
}

export default function FinancialDashboard({ datos }) {
  const periodoActual = obtenerPeriodoActual();

  const historicaRef = useRef(null);

  const mensualRef = useRef(null);

  const distribucionRef = useRef(null);

  const categoriasRef = useRef(null);

  const aniosDisponibles = datos?.aniosDisponibles ?? [];

  const [anioMensual, setAnioMensual] = useState(
    datos?.mensual?.anio ?? new Date().getFullYear(),
  );

  const [datosMensuales, setDatosMensuales] = useState(
    datos?.mensual?.datos ?? [],
  );

  const [cargandoMensual, setCargandoMensual] = useState(false);

  const [resumen, setResumen] = useState(
    datos?.resumenPeriodo ?? {
      ingresos: 0,
      pendienteCobro: 0,
      egresosRegistrados: 0,
      viaticos: 0,
      egresosTotales: 0,
      utilidad: 0,
      margen: 0,
      desde: periodoActual,
      hasta: periodoActual,
    },
  );

  const [desdeResumen, setDesdeResumen] = useState(
    datos?.resumenPeriodo?.desde ?? periodoActual,
  );

  const [hastaResumen, setHastaResumen] = useState(
    datos?.resumenPeriodo?.hasta ?? periodoActual,
  );

  const [cargandoResumen, setCargandoResumen] = useState(false);

  const [categorias, setCategorias] = useState(
    datos?.categoriasEgresos?.datos ?? [],
  );

  const [desdeCategorias, setDesdeCategorias] = useState(
    datos?.categoriasEgresos?.desde ?? periodoActual,
  );

  const [hastaCategorias, setHastaCategorias] = useState(
    datos?.categoriasEgresos?.hasta ?? periodoActual,
  );

  const [cargandoCategorias, setCargandoCategorias] = useState(false);

  const [modalReporteAbierto, setModalReporteAbierto] = useState(false);

  const [generandoReporte, setGenerandoReporte] = useState(false);

  const [opcionesReporte, setOpcionesReporte] = useState({
    resumen: true,
    historica: true,
    mensual: true,
    distribucion: true,
    categorias: true,
  });

  async function cambiarAnioMensual(nuevoAnio) {
    const anioAnterior = anioMensual;

    setAnioMensual(nuevoAnio);
    setCargandoMensual(true);

    try {
      const response =
        await dashboardService.obtenerEvolucionMensual(nuevoAnio);

      setDatosMensuales(response?.datos ?? []);
    } catch (error) {
      setAnioMensual(anioAnterior);

      await Swal.fire({
        icon: "error",
        title: "No se pudo cargar la gráfica",
        text: error.message || "No fue posible consultar la evolución mensual.",
      });
    } finally {
      setCargandoMensual(false);
    }
  }

  async function aplicarResumen() {
    if (desdeResumen > hastaResumen) {
      await Swal.fire({
        icon: "warning",
        title: "Periodo inválido",
        text: "El periodo inicial no puede ser posterior al periodo final.",
      });

      return;
    }

    setCargandoResumen(true);

    try {
      const response = await dashboardService.obtenerResumenPeriodo(
        desdeResumen,
        hastaResumen,
      );

      setResumen(response);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo cargar el resumen",
        text: error.message || "No fue posible consultar el periodo.",
      });
    } finally {
      setCargandoResumen(false);
    }
  }

  async function aplicarCategorias() {
    if (desdeCategorias > hastaCategorias) {
      await Swal.fire({
        icon: "warning",
        title: "Periodo inválido",
        text: "El periodo inicial no puede ser posterior al periodo final.",
      });

      return;
    }

    setCargandoCategorias(true);

    try {
      const response = await dashboardService.obtenerCategoriasEgresos(
        desdeCategorias,
        hastaCategorias,
      );

      setCategorias(response?.datos ?? []);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudieron cargar las categorías",
        text: error.message || "No fue posible consultar los egresos.",
      });
    } finally {
      setCargandoCategorias(false);
    }
  }

  function cambiarOpcionReporte(opcion) {
    setOpcionesReporte((actual) => ({
      ...actual,
      [opcion]: !actual[opcion],
    }));
  }

  async function generarReporte() {
    const haySeleccion = Object.values(opcionesReporte).some(Boolean);

    if (!haySeleccion) {
      await Swal.fire({
        icon: "warning",
        title: "Selecciona contenido",
        text: "Selecciona al menos un elemento para generar el reporte.",
      });

      return;
    }

    setGenerandoReporte(true);

    try {
      await generarReporteDashboard({
        opciones: opcionesReporte,

        resumen,

        anioMensual,

        referencias: {
          historica: historicaRef.current,

          mensual: mensualRef.current,

          distribucion: distribucionRef.current,

          categorias: categoriasRef.current,
        },
      });

      setModalReporteAbierto(false);
    } catch (error) {
      console.error("Error generando reporte:", error);

      await Swal.fire({
        icon: "error",
        title: "No se pudo generar el reporte",
        text: error.message || "Ocurrió un error generando el PDF.",
      });
    } finally {
      setGenerandoReporte(false);
    }
  }

  const selectClass =
    "rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <>
      <div className="mx-auto max-w-[95rem] space-y-7 pb-12">
        <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black text-slate-800">
              <TrendingUp className="text-blue-700" />
              Resumen financiero
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Ingresos, egresos, utilidad y evolución operativa de la empresa.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalReporteAbierto(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-blue-800"
          >
            <Download size={17} />
            Generar reporte
          </button>
        </header>

        <div ref={historicaRef}>
          <FinancialBarChart
            titulo="Evolución histórica anual"
            descripcion="Comparación anual de ingresos, egresos y utilidad."
            datos={datos?.historico ?? []}
            ejeX="anio"
          />
        </div>

        <div ref={mensualRef}>
          <FinancialBarChart
            titulo="Evolución mensual"
            descripcion={`Comparación de enero a diciembre de ${anioMensual}.`}
            datos={datosMensuales}
            ejeX="mes"
            controles={
              <div className="relative">
                <select
                  value={anioMensual}
                  disabled={cargandoMensual}
                  onChange={(event) =>
                    cambiarAnioMensual(Number(event.target.value))
                  }
                  className={selectClass}
                >
                  {aniosDisponibles.map((anio) => (
                    <option key={anio} value={anio}>
                      {anio}
                    </option>
                  ))}
                </select>

                {cargandoMensual && (
                  <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-blue-600" />
                )}
              </div>
            }
          />
        </div>

        <div ref={distribucionRef}>
          <FinancialSummary
            resumen={resumen}
            desde={desdeResumen}
            hasta={hastaResumen}
            onDesdeChange={setDesdeResumen}
            onHastaChange={setHastaResumen}
            onAplicar={aplicarResumen}
            cargando={cargandoResumen}
          />
        </div>

        <div ref={categoriasRef}>
          <ExpenseCategoriesChart
            datos={categorias}
            desde={desdeCategorias}
            hasta={hastaCategorias}
            onDesdeChange={setDesdeCategorias}
            onHastaChange={setHastaCategorias}
            onAplicar={aplicarCategorias}
            cargando={cargandoCategorias}
          />
        </div>
      </div>

      <DashboardReportModal
        abierto={modalReporteAbierto}
        opciones={opcionesReporte}
        onCambiarOpcion={cambiarOpcionReporte}
        onCerrar={() => setModalReporteAbierto(false)}
        onGenerar={generarReporte}
        generando={generandoReporte}
      />
    </>
  );
}
