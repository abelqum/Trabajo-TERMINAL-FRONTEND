import imageCompression from "browser-image-compression";

import { apiClient } from "@/lib/api/apiClient";

function obtenerContenido(response) {
  return response?.data ?? response;
}

function normalizarCatalogo(elemento) {
  if (!elemento) {
    return null;
  }

  return {
    id: elemento.id ?? null,

    nombre: elemento.nombre ?? "",
  };
}

function normalizarProveedor(proveedor) {
  if (!proveedor) {
    return null;
  }

  return {
    id: proveedor.id ?? null,

    nombre: proveedor.nombre ?? "",

    enlace: proveedor.enlace ?? null,
  };
}

export function normalizarProducto(producto) {
  return {
    id: producto?.id ?? null,

    descripcion: producto?.descripcion ?? "",

    modelo: producto?.modelo ?? null,

    cantidad: Number(producto?.cantidad ?? 0),

    stockMinimo: Number(producto?.stockMinimo ?? 0),

    precioUnitario: Number(producto?.precioUnitario ?? 0),

    fila: producto?.fila ?? null,

    esKit: Boolean(producto?.esKit),

    fotoUrl: producto?.fotoUrl ?? null,

    codigoQr:
      producto?.codigoQr ?? (producto?.id ? `INV:${producto.id}` : null),

    categoria: normalizarCatalogo(producto?.categoria),

    marca: normalizarCatalogo(producto?.marca),

    unidadMedida: normalizarCatalogo(producto?.unidadMedida),

    almacen: normalizarCatalogo(producto?.almacen),

    condicion: normalizarCatalogo(producto?.condicion),

    medida: normalizarCatalogo(producto?.medida),

    proveedor: normalizarProveedor(producto?.proveedor),

    permisos: {
      editar: Boolean(producto?.permisos?.editar ?? true),

      eliminar: Boolean(producto?.permisos?.eliminar ?? true),

      ajustarStock: Boolean(producto?.permisos?.ajustarStock ?? true),

      duplicar: Boolean(producto?.permisos?.duplicar ?? true),

      armarKit: Boolean(producto?.permisos?.armarKit),

      desarmarKit: Boolean(producto?.permisos?.desarmarKit),
    },
  };
}

function normalizarPagina(response) {
  const data = obtenerContenido(response) ?? {};

  return {
    content: Array.isArray(data.content)
      ? data.content.map(normalizarProducto)
      : [],

    number: Number(data.number ?? 0),

    size: Number(data.size ?? 15),

    totalElements: Number(data.totalElements ?? 0),

    totalPages: Number(data.totalPages ?? 0),

    resumen: {
      valorInventario: Number(data.resumen?.valorInventario ?? 0),

      productosStockBajo: Number(data.resumen?.productosStockBajo ?? 0),

      cantidadProductos: Number(
        data.resumen?.cantidadProductos ?? data.totalElements ?? 0,
      ),
    },
  };
}

function agregarFiltros(params, filtros) {
  if (filtros.search?.trim()) {
    params.set("search", filtros.search.trim());
  }

  if (filtros.marcaId) {
    params.set("marcaId", filtros.marcaId);
  }

  if (filtros.categoriaId) {
    params.set("categoriaId", filtros.categoriaId);
  }

  if (filtros.medidaId) {
    params.set("medidaId", filtros.medidaId);
  }

  if (filtros.almacenId) {
    params.set("almacenId", filtros.almacenId);
  }

  if (filtros.estatus) {
    params.set("estatus", filtros.estatus);
  }
}

async function optimizarFoto(archivo) {
  if (!archivo) {
    return null;
  }

  if (!archivo.type.startsWith("image/")) {
    throw new Error("La fotografía debe ser una imagen.");
  }

  const comprimida = await imageCompression(archivo, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.8,
  });

  return new File([comprimida], `producto_${Date.now()}.webp`, {
    type: comprimida.type || "image/webp",
  });
}

async function crearFormData(datos, foto) {
  const formData = new FormData();

  formData.append(
    "datos",
    new Blob([JSON.stringify(datos)], {
      type: "application/json",
    }),
  );

  if (foto) {
    const optimizada = await optimizarFoto(foto);

    formData.append("foto", optimizada);
  }

  return formData;
}

export const inventoryService = {
  async obtenerInventario({ page = 0, size = 15, filtros = {}, signal } = {}) {
    const params = new URLSearchParams();

    params.set("page", page);

    params.set("size", size);

    params.set("sort", "descripcion,asc");

    agregarFiltros(params, filtros);

    const response = await apiClient(`/inventario?${params.toString()}`, {
      method: "GET",
      signal,
    });

    return normalizarPagina(response);
  },

  async obtenerCatalogos({ signal } = {}) {
    const response = await apiClient("/inventario/catalogos", {
      method: "GET",
      signal,
    });

    return (
      obtenerContenido(response) ?? {
        unidadesMedida: [],
        marcas: [],
        almacenes: [],
        condiciones: [],
        categorias: [],
        proveedores: [],
        medidas: [],
      }
    );
  },

  async obtenerProductoPorQr(codigo) {
    const params = new URLSearchParams({
      codigo,
    });

    const response = await apiClient(`/inventario/qr?${params.toString()}`);

    return normalizarProducto(obtenerContenido(response));
  },

  async crearProducto(datos, foto = null) {
    const body = await crearFormData(datos, foto);

    const response = await apiClient("/inventario", {
      method: "POST",
      body,
    });

    return normalizarProducto(obtenerContenido(response));
  },

  async actualizarProducto(id, datos, foto = null) {
    const body = await crearFormData(datos, foto);

    const response = await apiClient(`/inventario/${id}`, {
      method: "PUT",
      body,
    });

    return normalizarProducto(obtenerContenido(response));
  },

  eliminarProducto(id) {
    return apiClient(`/inventario/${id}`, {
      method: "DELETE",
    });
  },

  eliminarProductos(ids) {
    return apiClient("/inventario/lote", {
      method: "DELETE",

      body: {
        ids,
      },
    });
  },

  async duplicarProducto(id) {
    const response = await apiClient(`/inventario/${id}/duplicar`, {
      method: "POST",
    });

    return normalizarProducto(obtenerContenido(response));
  },

  async ajustarStock(id, { tipo, cantidad, motivo }) {
    const response = await apiClient(`/inventario/${id}/ajustes`, {
      method: "POST",

      body: {
        tipo,
        cantidad,
        motivo,
      },
    });

    return normalizarProducto(obtenerContenido(response));
  },

  armarKit(id, cantidad = 1) {
    return apiClient(`/inventario/${id}/armar`, {
      method: "POST",

      body: {
        cantidad,
      },
    });
  },

  desarmarKit(id, cantidad = 1) {
    return apiClient(`/inventario/${id}/desarmar`, {
      method: "POST",

      body: {
        cantidad,
      },
    });
  },

  async obtenerDatosReporte({ filtros = {} }) {
    const params = new URLSearchParams();

    agregarFiltros(params, filtros);

    const response = await apiClient(
      `/inventario/reporte?${params.toString()}`,
    );

    const data = obtenerContenido(response) ?? {};

    return {
      productos: Array.isArray(data.productos)
        ? data.productos.map(normalizarProducto)
        : [],

      valorInventario: Number(data.valorInventario ?? 0),
    };
  },
};
