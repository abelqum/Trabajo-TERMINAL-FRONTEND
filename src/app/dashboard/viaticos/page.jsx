"use client";

import { useEffect, useState } from "react";

import { CarFront, Plus } from "lucide-react";

import Swal from "sweetalert2";

import Pagination from "@/components/common/Pagination";

import TravelCard from "@/components/viatics/TravelCard";
import TravelDetailModal from "@/components/viatics/TravelDetailModal";
import TravelFormModal from "@/components/viatics/TravelFormModal";

import { ApiError } from "@/lib/api/apiClient";

import { generarLiquidacionViatico } from "@/lib/reports/viaticsReport";

import { viaticsService } from "@/services/viaticsService";

const ITEMS_POR_PAGINA = 9;

const PAGINA_INICIAL = {
  content: [],
  number: 0,
  size: ITEMS_POR_PAGINA,
  totalElements: 0,
  totalPages: 0,

  permisos: {
    crearViaje: false,
  },
};

export default function ViaticosPage() {
  const [pagina, setPagina] = useState(PAGINA_INICIAL);

  const [paginaActual, setPaginaActual] = useState(0);

  const [cargando, setCargando] = useState(true);

  const [recarga, setRecarga] = useState(0);

  const [modalViajeAbierto, setModalViajeAbierto] = useState(false);

  const [viajeSeleccionado, setViajeSeleccionado] = useState(null);

  const [usuariosAsignables, setUsuariosAsignables] = useState([]);

  const [detalleAbierto, setDetalleAbierto] = useState(false);

  const [viajeDetalle, setViajeDetalle] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function cargar() {
      try {
        const response = await viaticsService.obtenerViajes({
          page: paginaActual,

          size: ITEMS_POR_PAGINA,

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

        console.error(error);

        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          return;
        }

        await Swal.fire({
          icon: "error",

          title: "No se pudieron cargar los viáticos",

          text: error.message || "No fue posible consultar los viajes.",
        });
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargar();

    return () => {
      controller.abort();
    };
  }, [paginaActual, recarga]);

  async function obtenerUsuarios() {
    const usuarios = await viaticsService.obtenerUsuariosAsignables();

    setUsuariosAsignables(usuarios);

    return usuarios;
  }

  async function abrirNuevoViaje() {
    try {
      await obtenerUsuarios();

      setViajeSeleccionado(null);

      setModalViajeAbierto(true);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudieron cargar los usuarios",
        text: error.message,
      });
    }
  }

  async function abrirEditar(viaje) {
    try {
      const [usuarios, detalle] = await Promise.all([
        viaticsService.obtenerUsuariosAsignables(),

        viaticsService.obtenerViaje(viaje.id),
      ]);

      setUsuariosAsignables(usuarios);

      setViajeSeleccionado(detalle);

      setModalViajeAbierto(true);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo cargar el viaje",
        text: error.message,
      });
    }
  }

  async function abrirDetalle(viaje) {
    try {
      const detalle = await viaticsService.obtenerViaje(viaje.id);

      setViajeDetalle(detalle);

      setDetalleAbierto(true);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo abrir el viaje",
        text: error.message,
      });
    }
  }

  async function generarReporte(viaje) {
    try {
      const detalle = await viaticsService.obtenerViaje(viaje.id);

      generarLiquidacionViatico(detalle);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo generar la liquidación",
        text: error.message,
      });
    }
  }

  function cerrarModalViaje() {
    setModalViajeAbierto(false);

    setViajeSeleccionado(null);
  }

  function viajeGuardado() {
    cerrarModalViaje();

    setCargando(true);

    setRecarga((actual) => actual + 1);
  }

  function detalleActualizado() {
    setRecarga((actual) => actual + 1);
  }

  function cambiarPagina(nuevaPagina) {
    setCargando(true);

    setPaginaActual(nuevaPagina);
  }

  return (
    <>
      <div className="mx-auto max-w-[90rem] space-y-6 pb-12">
        <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black text-slate-800">
              <CarFront className="text-brand-700" />
              Viajes y Viáticos
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Gestión de viajes, presupuestos, personal y comprobación de
              gastos.
            </p>
          </div>

          {pagina.permisos.crearViaje && (
            <button
              type="button"
              onClick={abrirNuevoViaje}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-md hover:bg-brand-800"
            >
              <Plus size={16} />
              Crear viaje
            </button>
          )}
        </header>

        {cargando ? (
          <div className="flex min-h-[450px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-brand-700 border-t-transparent" />

              <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400">
                Cargando viajes
              </p>
            </div>
          </div>
        ) : pagina.content.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white">
            <div className="text-center">
              <CarFront size={46} className="mx-auto text-slate-300" />

              <h2 className="mt-4 font-black text-slate-700">No hay viajes</h2>

              <p className="mt-1 text-sm text-slate-400">
                {pagina.permisos.crearViaje
                  ? "Crea el primer viaje para comenzar."
                  : "No tienes viajes asignados."}
              </p>
            </div>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {pagina.content.map((viaje) => (
                <TravelCard
                  key={viaje.id}
                  viaje={viaje}
                  onAbrir={abrirDetalle}
                  onEditar={abrirEditar}
                  onReporte={generarReporte}
                />
              ))}
            </section>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <Pagination
                page={pagina.number}
                totalPages={pagina.totalPages}
                totalElements={pagina.totalElements}
                onPageChange={cambiarPagina}
              />
            </div>
          </>
        )}
      </div>

      {modalViajeAbierto && (
        <TravelFormModal
          key={viajeSeleccionado?.id ?? "nuevo-viaje"}
          viaje={viajeSeleccionado}
          usuarios={usuariosAsignables}
          onClose={cerrarModalViaje}
          onSaved={viajeGuardado}
        />
      )}

      {detalleAbierto && viajeDetalle && (
        <TravelDetailModal
          key={viajeDetalle.id}
          viajeInicial={viajeDetalle}
          onClose={() => {
            setDetalleAbierto(false);

            setViajeDetalle(null);
          }}
          onChanged={detalleActualizado}
        />
      )}
    </>
  );
}
