import { apiClient } from "@/lib/api/apiClient";

function obtenerContenido(response) {
  return response?.data ?? response;
}

function construirQuery({ page = 0, size = 10, search = "" } = {}) {
  const params = new URLSearchParams();

  params.set("page", page);
  params.set("size", size);
  params.set("sort", "razonSocial,asc");

  if (search.trim()) {
    params.set("search", search.trim());
  }

  return params.toString();
}

function normalizarCliente(cliente) {
  return {
    id: cliente?.id ?? null,

    razonSocial: cliente?.razonSocial ?? "",

    rfc: cliente?.rfc ?? "",

    telefonos: Array.isArray(cliente?.telefonos) ? cliente.telefonos : [],

    correos: Array.isArray(cliente?.correos) ? cliente.correos : [],

    creadoEn: cliente?.creadoEn ?? null,

    actualizadoEn: cliente?.actualizadoEn ?? null,
  };
}

function normalizarPagina(response) {
  const pagina = obtenerContenido(response) ?? {};

  const contenido = Array.isArray(pagina.content)
    ? pagina.content.map(normalizarCliente)
    : [];

  return {
    content: contenido,

    number: Number(pagina.number ?? 0),

    size: Number(pagina.size ?? 10),

    totalElements: Number(pagina.totalElements ?? 0),

    totalPages: Number(pagina.totalPages ?? 0),

    first: Boolean(pagina.first ?? pagina.number === 0),

    last: Boolean(pagina.last ?? pagina.number >= pagina.totalPages - 1),
  };
}

export const clientsService = {
  async obtenerClientes({ page = 0, size = 10, search = "", signal } = {}) {
    const query = construirQuery({
      page,
      size,
      search,
    });

    const response = await apiClient(`/clientes?${query}`, {
      method: "GET",
      signal,
    });

    return normalizarPagina(response);
  },

  async crearCliente(cliente) {
    const response = await apiClient("/clientes", {
      method: "POST",
      body: cliente,
    });

    return normalizarCliente(obtenerContenido(response));
  },

  async actualizarCliente(id, cliente) {
    const response = await apiClient(`/clientes/${id}`, {
      method: "PUT",
      body: cliente,
    });

    return normalizarCliente(obtenerContenido(response));
  },

  async eliminarCliente(id) {
    return apiClient(`/clientes/${id}`, {
      method: "DELETE",
    });
  },
};
