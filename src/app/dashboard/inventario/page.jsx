"use client";

import { useCallback, useEffect, useState } from "react";

import {
  DollarSign,
  FileText,
  Package,
  Plus,
  ScanLine,
  TableProperties,
  Trash2,
} from "lucide-react";

import QRCode from "qrcode";
import Swal from "sweetalert2";

import Pagination from "@/components/common/Pagination";

import InventoryFilters, {
  DEFAULT_INVENTORY_FILTERS,
} from "@/components/inventory/InventoryFilters";

import InventoryQrScanner from "@/components/inventory/InventoryQrScanner";
import InventoryTable from "@/components/inventory/InventoryTable";
import ProductFormModal from "@/components/inventory/ProductFormModal";
import StockAdjustmentModal from "@/components/inventory/StockAdjustmentModal";

import {
  generarCatalogoInventario,
  generarReporteInventario,
} from "@/lib/reports/inventoryReports";

import { inventoryService } from "@/services/inventoryService";

const ITEMS_POR_PAGINA = 15;

const CATALOGOS_INICIALES = {
  unidadesMedida: [],
  marcas: [],
  almacenes: [],
  condiciones: [],
  categorias: [],
  proveedores: [],
  medidas: [],
};

const PAGINA_INICIAL = {
  content: [],
  number: 0,
  size: ITEMS_POR_PAGINA,
  totalElements: 0,
  totalPages: 0,

  resumen: {
    valorInventario: 0,
    productosStockBajo: 0,
    cantidadProductos: 0,
  },
};

export default function InventarioPage() {
  const [pagina, setPagina] = useState(PAGINA_INICIAL);

  const [catalogos, setCatalogos] = useState(CATALOGOS_INICIALES);

  const [filtros, setFiltros] = useState(DEFAULT_INVENTORY_FILTERS);

  const [paginaActual, setPaginaActual] = useState(0);

  const [cargando, setCargando] = useState(true);

  const [recarga, setRecarga] = useState(0);

  const [selectedIds, setSelectedIds] = useState([]);

  const [productoEdicion, setProductoEdicion] = useState(null);

  const [modalProducto, setModalProducto] = useState(false);

  const [productoAjuste, setProductoAjuste] = useState(null);

  const [qrDataUrl, setQrDataUrl] = useState(null);

  const [scannerAbierto, setScannerAbierto] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function cargarCatalogos() {
      try {
        const response = await inventoryService.obtenerCatalogos({
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setCatalogos(response);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);
        }
      }
    }

    cargarCatalogos();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function cargarInventario() {
      try {
        const response = await inventoryService.obtenerInventario({
          page: paginaActual,

          size: ITEMS_POR_PAGINA,

          filtros,

          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setPagina(response);

        setSelectedIds([]);
      } catch (error) {
        if (error.name === "AbortError" || controller.signal.aborted) {
          return;
        }

        console.error(error);

        await Swal.fire({
          icon: "error",
          title: "No se pudo cargar el inventario",
          text: error.message,
        });
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargarInventario();

    return () => {
      controller.abort();
    };
  }, [paginaActual, filtros, recarga]);

  const recargar = useCallback(() => {
    setCargando(true);

    setRecarga((actual) => actual + 1);
  }, []);

  function aplicarFiltros(nuevosFiltros) {
    setPaginaActual(0);

    setFiltros(nuevosFiltros);

    setCargando(true);
  }

  function seleccionar(id) {
    setSelectedIds((actuales) =>
      actuales.includes(id)
        ? actuales.filter((actual) => actual !== id)
        : [...actuales, id],
    );
  }

  function seleccionarPagina(seleccionado, productos) {
    const ids = productos.map((producto) => producto.id);

    if (seleccionado) {
      setSelectedIds((actuales) => [...new Set([...actuales, ...ids])]);

      return;
    }

    setSelectedIds((actuales) => actuales.filter((id) => !ids.includes(id)));
  }

  async function abrirAjuste(producto) {
    try {
      const qr = await QRCode.toDataURL(producto.codigoQr, {
        width: 300,
        margin: 1,
      });

      setQrDataUrl(qr);

      setProductoAjuste(producto);
    } catch {
      setQrDataUrl(null);

      setProductoAjuste(producto);
    }
  }

  function nuevoProducto() {
    setProductoEdicion(null);

    setModalProducto(true);
  }

  function editarProducto(producto) {
    setProductoEdicion(producto);

    setModalProducto(true);
  }

  function cerrarProducto() {
    setModalProducto(false);

    setProductoEdicion(null);
  }

  async function productoGuardado() {
    cerrarProducto();

    recargar();
  }

  async function eliminarProducto(producto) {
    const confirmacion = await Swal.fire({
      icon: "warning",

      title: "¿Eliminar producto?",

      text: "Se eliminará el producto y su fotografía. Si tiene historial que deba conservarse, el backend impedirá la eliminación.",

      showCancelButton: true,

      confirmButtonText: "Eliminar",

      cancelButtonText: "Cancelar",

      confirmButtonColor: "#dc2626",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    try {
      await inventoryService.eliminarProducto(producto.id);

      await Swal.fire({
        icon: "success",
        title: "Producto eliminado",
        timer: 1200,
        showConfirmButton: false,
      });

      recargar();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo eliminar",
        text: error.message,
      });
    }
  }

  async function eliminarSeleccionados() {
    if (!selectedIds.length) {
      return;
    }

    const confirmacion = await Swal.fire({
      icon: "warning",

      title: `¿Eliminar ${selectedIds.length} productos?`,

      text: "Se intentarán eliminar todos los productos seleccionados.",

      showCancelButton: true,

      confirmButtonText: "Eliminar",

      cancelButtonText: "Cancelar",

      confirmButtonColor: "#dc2626",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    try {
      await inventoryService.eliminarProductos(selectedIds);

      setSelectedIds([]);

      recargar();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo completar la eliminación",
        text: error.message,
      });
    }
  }

  async function duplicarProducto(producto) {
    const confirmacion = await Swal.fire({
      icon: "question",

      title: "¿Duplicar producto?",

      text: `Se creará una copia de ${producto.descripcion} con stock inicial en 0.`,

      showCancelButton: true,

      confirmButtonText: "Duplicar",

      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    try {
      await inventoryService.duplicarProducto(producto.id);

      recargar();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo duplicar",
        text: error.message,
      });
    }
  }

  async function armarKit(producto) {
    const confirmacion = await Swal.fire({
      icon: "question",
      title: "¿Armar kit?",
      text: "Se descontarán automáticamente sus componentes del inventario.",
      showCancelButton: true,
      confirmButtonText: "Armar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#059669",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    try {
      await inventoryService.armarKit(producto.id);

      recargar();

      await Swal.fire({
        icon: "success",
        title: "Kit armado",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo armar el kit",
        text: error.message,
      });
    }
  }

  async function desarmarKit(producto) {
    if (producto.cantidad <= 0) {
      await Swal.fire({
        icon: "warning",
        title: "No hay kits armados",
      });

      return;
    }

    try {
      await inventoryService.desarmarKit(producto.id);

      recargar();

      await Swal.fire({
        icon: "success",
        title: "Kit desarmado",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo desarmar",
        text: error.message,
      });
    }
  }

  async function escaneoExitoso(codigo) {
    setScannerAbierto(false);

    try {
      const producto = await inventoryService.obtenerProductoPorQr(codigo);

      await abrirAjuste(producto);
    } catch (error) {
      await Swal.fire({
        icon: "warning",
        title: "Producto no encontrado",
        text: "El QR no corresponde a un producto registrado.",
      });
    }
  }

  async function reporteTabla() {
    try {
      const datos = await inventoryService.obtenerDatosReporte({
        filtros,
      });

      if (!datos.productos.length) {
        return;
      }

      generarReporteInventario(datos.productos, datos.valorInventario);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo generar el reporte",
        text: error.message,
      });
    }
  }

  async function catalogoPdf() {
    try {
      const datos = await inventoryService.obtenerDatosReporte({
        filtros,
      });

      if (!datos.productos.length) {
        return;
      }

      await generarCatalogoInventario(datos.productos);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo generar el catálogo",
        text: error.message,
      });
    }
  }

  return (
    <>
      <div className="mx-auto max-w-[95rem] space-y-6 pb-12">
        <header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 xl:flex-row xl:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black text-slate-800">
              <Package className="text-brand-700" />
              Control de Inventario
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Gestión de productos, existencias, kits y valoración.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={eliminarSeleccionados}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-black uppercase text-red-700"
              >
                <Trash2 size={15} />
                Borrar ({selectedIds.length})
              </button>
            )}

            <button
              type="button"
              onClick={reporteTabla}
              className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-black uppercase text-emerald-700"
            >
              <TableProperties size={15} />
              Reporte
            </button>

            <button
              type="button"
              onClick={catalogoPdf}
              className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-xs font-black uppercase text-brand-700"
            >
              <FileText size={15} />
              Catálogo
            </button>

            <button
              type="button"
              onClick={() => setScannerAbierto(true)}
              className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-xs font-black uppercase text-white"
            >
              <ScanLine size={15} />
              Escanear QR
            </button>

            <button
              type="button"
              onClick={nuevoProducto}
              className="flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-3 text-xs font-black uppercase text-white"
            >
              <Plus size={15} />
              Nuevo
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <DollarSign className="text-emerald-700" />

            <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-emerald-600">
              Valor filtrado
            </p>

            <p className="mt-1 text-2xl font-black text-emerald-950">
              {new Intl.NumberFormat("es-MX", {
                style: "currency",
                currency: "MXN",
              }).format(pagina.resumen.valorInventario)}
            </p>
          </article>

          <article className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
            <Package className="text-brand-700" />

            <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-brand-600">
              Productos
            </p>

            <p className="mt-1 text-2xl font-black text-brand-950">
              {pagina.resumen.cantidadProductos}
            </p>
          </article>

          <article className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <Package className="text-red-700" />

            <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-red-600">
              Stock bajo
            </p>

            <p className="mt-1 text-2xl font-black text-red-950">
              {pagina.resumen.productosStockBajo}
            </p>
          </article>
        </section>

        <InventoryFilters catalogos={catalogos} onAplicar={aplicarFiltros} />

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <InventoryTable
            productos={pagina.content}
            cargando={cargando}
            selectedIds={selectedIds}
            onSeleccionar={seleccionar}
            onSeleccionarPagina={seleccionarPagina}
            onAjustar={abrirAjuste}
            onEditar={editarProducto}
            onEliminar={eliminarProducto}
            onDuplicar={duplicarProducto}
            onArmar={armarKit}
            onDesarmar={desarmarKit}
          />

          {!cargando && (
            <Pagination
              page={pagina.number}
              totalPages={pagina.totalPages}
              totalElements={pagina.totalElements}
              onPageChange={(nueva) => {
                setPaginaActual(nueva);

                setCargando(true);
              }}
            />
          )}
        </section>
      </div>

      {modalProducto && (
        <ProductFormModal
          key={productoEdicion?.id ?? "nuevo-producto"}
          producto={productoEdicion}
          catalogos={catalogos}
          onClose={cerrarProducto}
          onSaved={productoGuardado}
        />
      )}

      {productoAjuste && (
        <StockAdjustmentModal
          key={productoAjuste.id}
          producto={productoAjuste}
          qrDataUrl={qrDataUrl}
          onClose={() => {
            setProductoAjuste(null);

            setQrDataUrl(null);
          }}
          onUpdated={() => {
            setProductoAjuste(null);

            setQrDataUrl(null);

            recargar();
          }}
        />
      )}

      {scannerAbierto && (
        <InventoryQrScanner
          onScan={escaneoExitoso}
          onClose={() => setScannerAbierto(false)}
        />
      )}
    </>
  );
}
