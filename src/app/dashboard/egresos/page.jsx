"use client";

import { useEffect, useState } from "react";

import { Plus, WalletCards } from "lucide-react";

import Swal from "sweetalert2";

import ExpenseFormModal from "@/components/expenses/ExpenseFormModal";
import ExpenseMonthCard from "@/components/expenses/ExpenseMonthCard";
import ExpensePeriodFilter from "@/components/expenses/ExpensePeriodFilter";
import ExpenseSummary from "@/components/expenses/ExpenseSummary";

import { ApiError } from "@/lib/api/apiClient";

import { expensesService } from "@/services/expensesService";

function obtenerMesActual() {
  const fecha = new Date();

  const anio = fecha.getFullYear();

  const mes = String(fecha.getMonth() + 1).padStart(2, "0");

  return `${anio}-${mes}`;
}

const RESUMEN_INICIAL = {
  total: 0,
  totalRegistrados: 0,
  totalViaticos: 0,
  cantidadRegistrados: 0,
  cantidadViaticos: 0,
};

export default function EgresosPage() {
  const mesActual = obtenerMesActual();

  const [periodo, setPeriodo] = useState({
    desde: mesActual,
    hasta: mesActual,
  });

  const [datos, setDatos] = useState({
    resumen: RESUMEN_INICIAL,
    meses: [],
  });

  const [cargando, setCargando] = useState(true);

  const [recarga, setRecarga] = useState(0);

  const [modalAbierto, setModalAbierto] = useState(false);

  const [egresoSeleccionado, setEgresoSeleccionado] = useState(null);

  const [fechaInicialModal, setFechaInicialModal] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function cargarDatos() {
      try {
        const response = await expensesService.obtenerEgresos({
          desde: periodo.desde,

          hasta: periodo.hasta,

          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setDatos(response);
      } catch (error) {
        if (error.name === "AbortError" || controller.signal.aborted) {
          return;
        }

        console.error("Error cargando egresos:", error);

        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          return;
        }

        await Swal.fire({
          icon: "error",

          title: "No se pudieron cargar los egresos",

          text:
            error.message ||
            "No fue posible consultar la información del servidor.",

          confirmButtonColor: "#dc2626",
        });
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargarDatos();

    return () => {
      controller.abort();
    };
  }, [periodo, recarga]);

  function aplicarPeriodo(nuevoPeriodo) {
    setCargando(true);

    setPeriodo(nuevoPeriodo);
  }

  function abrirNuevo(periodoMes = null) {
    setEgresoSeleccionado(null);

    if (periodoMes) {
      setFechaInicialModal(`${periodoMes}-01`);
    } else {
      setFechaInicialModal(null);
    }

    setModalAbierto(true);
  }

  function abrirEdicion(egreso) {
    /*
     * Solamente los egresos
     * registrados manualmente
     * se editan desde aquí.
     */
    if (egreso.origen !== "REGISTRADO") {
      return;
    }

    setEgresoSeleccionado(egreso);

    setFechaInicialModal(null);

    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);

    setEgresoSeleccionado(null);

    setFechaInicialModal(null);
  }

  function egresoGuardado() {
    cerrarModal();

    setCargando(true);

    setRecarga((actual) => actual + 1);
  }

  return (
    <>
      <div className="mx-auto max-w-[90rem] space-y-6 pb-12">
        <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black text-slate-800">
              <WalletCards className="text-brand-700" />
              Egresos
            </h1>

            <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">
              Consulta los egresos registrados y los viáticos aprobados de la
              empresa en un solo lugar.
            </p>
          </div>

          <button
            type="button"
            onClick={() => abrirNuevo()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-md transition hover:bg-brand-800 active:scale-[0.98] sm:w-auto"
          >
            <Plus size={16} />
            Nuevo egreso
          </button>
        </header>

        <ExpensePeriodFilter
          key={`${periodo.desde}-${periodo.hasta}`}
          desdeInicial={periodo.desde}
          hastaInicial={periodo.hasta}
          cargando={cargando}
          onAplicar={aplicarPeriodo}
        />

        <ExpenseSummary
          resumen={datos.resumen}
          desde={periodo.desde}
          hasta={periodo.hasta}
        />

        {cargando ? (
          <div className="flex min-h-[350px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-700 border-t-transparent" />

              <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400">
                Cargando egresos
              </p>
            </div>
          </div>
        ) : datos.meses.length === 0 ? (
          <div className="flex min-h-[350px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
            <div className="text-center">
              <WalletCards size={40} className="mx-auto text-slate-300" />

              <h2 className="mt-4 font-black text-slate-700">
                Sin egresos en el periodo
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                No existen egresos registrados ni viáticos aprobados.
              </p>

              <button
                type="button"
                onClick={() => abrirNuevo(periodo.desde)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-brand-800"
              >
                <Plus size={15} />
                Registrar egreso
              </button>
            </div>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {datos.meses.map((mes) => (
              <ExpenseMonthCard
                key={mes.periodo}
                datos={mes}
                onNuevo={abrirNuevo}
                onEditar={abrirEdicion}
              />
            ))}
          </section>
        )}
      </div>

      {modalAbierto && (
        <ExpenseFormModal
          key={egresoSeleccionado?.id ?? fechaInicialModal ?? "nuevo-egreso"}
          egreso={egresoSeleccionado}
          fechaInicial={fechaInicialModal}
          onClose={cerrarModal}
          onSaved={egresoGuardado}
        />
      )}
    </>
  );
}
