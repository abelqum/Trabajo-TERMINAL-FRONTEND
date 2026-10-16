import { apiClient } from "@/lib/api/apiClient";

function obtenerContenido(response) {
  return response?.data ?? response;
}

function agregarFiltros(params, filtros = {}) {
  if (filtros.search?.trim()) {
    params.set("search", filtros.search.trim());
  }

  if (filtros.clienteId) {
    params.set("clienteId", filtros.clienteId);
  }

  if (filtros.tipoRegistro) {
    params.set("tipoRegistro", filtros.tipoRegistro);
  }

  if (filtros.estado) {
    params.set("estado", filtros.estado);
  }

  if (filtros.fechaDesde) {
    params.set("fechaDesde", filtros.fechaDesde);
  }

  if (filtros.fechaHasta) {
    params.set("fechaHasta", filtros.fechaHasta);
  }

  if (filtros.fechaReferencia) {
    params.set("fechaReferencia", filtros.fechaReferencia);
  }
}

function construirQuery({ page, size, filtros, incluirPaginacion = true }) {
  const params = new URLSearchParams();

  if (incluirPaginacion) {
    params.set("page", String(page ?? 0));

    params.set("size", String(size ?? 10));

    params.set("sort", "fecha,desc");
  }

  agregarFiltros(params, filtros);

  return params.toString();
}

function normalizarCliente(cliente) {
  return {
    id: cliente?.id ?? null,

    razonSocial: cliente?.razonSocial ?? "",

    rfc: cliente?.rfc ?? "",
  };
}

export function normalizarIngreso(ingreso) {
  return {
    id: ingreso?.id ?? null,

    tipoRegistro: ingreso?.tipoRegistro ?? "FACTURA",

    cliente: normalizarCliente(ingreso?.cliente),

    folio: ingreso?.folio ?? null,

    concepto: ingreso?.concepto ?? null,

    fecha: ingreso?.fecha ?? null,

    subtotal: Number(ingreso?.subtotal ?? 0),

    iva: Number(ingreso?.iva ?? 0),

    total: Number(ingreso?.total ?? 0),

    incluyeIva: ingreso?.incluyeIva ?? Number(ingreso?.iva ?? 0) > 0,

    estado: ingreso?.estado ?? "PENDIENTE",

    fechaPago: ingreso?.fechaPago ?? null,

    formaPago: ingreso?.formaPago ?? null,

    comentarios: ingreso?.comentarios ?? null,

    creadoEn: ingreso?.creadoEn ?? null,

    actualizadoEn: ingreso?.actualizadoEn ?? null,
  };
}

function normalizarPagina(response) {
  const pagina = obtenerContenido(response) ?? {};

  return {
    content: Array.isArray(pagina.content)
      ? pagina.content.map(normalizarIngreso)
      : [],

    number: Number(pagina.number ?? 0),

    size: Number(pagina.size ?? 10),

    totalElements: Number(pagina.totalElements ?? 0),

    totalPages: Number(pagina.totalPages ?? 0),

    first: Boolean(pagina.first ?? pagina.number === 0),

    last: Boolean(pagina.last ?? pagina.number >= pagina.totalPages - 1),
  };
}

function normalizarResumen(response) {
  const resumen = obtenerContenido(response) ?? {};

  return {
    totalCobrado: Number(resumen.totalCobrado ?? 0),

    totalPendiente: Number(resumen.totalPendiente ?? 0),

    totalCancelado: Number(resumen.totalCancelado ?? 0),

    cantidadRegistros: Number(resumen.cantidadRegistros ?? 0),

    cantidadPagados: Number(resumen.cantidadPagados ?? 0),

    cantidadPendientes: Number(resumen.cantidadPendientes ?? 0),

    cantidadCancelados: Number(resumen.cantidadCancelados ?? 0),
  };
}

export const incomesService = {
  async obtenerIngresos({ page = 0, size = 10, filtros = {}, signal } = {}) {
    const query = construirQuery({
      page,
      size,
      filtros,
    });

    const response = await apiClient(`/ingresos?${query}`, {
      method: "GET",
      signal,
    });

    return normalizarPagina(response);
  },

  async obtenerResumen({ filtros = {}, signal } = {}) {
    const query = construirQuery({
      filtros,
      incluirPaginacion: false,
    });

    const response = await apiClient(`/ingresos/resumen?${query}`, {
      method: "GET",
      signal,
    });

    return normalizarResumen(response);
  },

  async obtenerOpcionesClientes({ signal } = {}) {
    const response = await apiClient("/clientes/opciones", {
      method: "GET",
      signal,
    });

    const clientes = obtenerContenido(response);

    if (!Array.isArray(clientes)) {
      return [];
    }

    return clientes.map(normalizarCliente);
  },

  async crearIngreso(datos) {
    const response = await apiClient("/ingresos", {
      method: "POST",
      body: datos,
    });

    return normalizarIngreso(obtenerContenido(response));
  },

  async actualizarIngreso(id, datos) {
    const response = await apiClient(`/ingresos/${id}`, {
      method: "PUT",
      body: datos,
    });

    return normalizarIngreso(obtenerContenido(response));
  },

  async eliminarIngreso(id) {
    return apiClient(`/ingresos/${id}`, {
      method: "DELETE",
    });
  },

  async obtenerDatosReporte({ filtros = {} } = {}) {
    const query = construirQuery({
      filtros,
      incluirPaginacion: false,
    });

    const response = await apiClient(`/ingresos/reporte?${query}`, {
      method: "GET",
    });

    const data = obtenerContenido(response) ?? {};

    return {
      registros: Array.isArray(data.registros)
        ? data.registros.map(normalizarIngreso)
        : [],

      resumen: normalizarResumen(data.resumen ?? {}),
    };
  },
};
