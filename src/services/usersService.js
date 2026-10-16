import { apiClient } from "@/lib/api/apiClient";

function obtenerContenido(response) {
  return response?.data ?? response;
}

export function normalizarUsuario(usuario) {
  return {
    id: usuario?.id ?? null,

    nombre: usuario?.nombre ?? "",

    email: usuario?.email ?? "",

    rol: String(usuario?.rol ?? "").toLowerCase(),

    creadoEn: usuario?.creadoEn ?? null,

    actualizadoEn: usuario?.actualizadoEn ?? null,

    permisos: {
      editar: Boolean(usuario?.permisos?.editar),

      eliminar: Boolean(usuario?.permisos?.eliminar),

      cambiarRol: Boolean(usuario?.permisos?.cambiarRol),

      restablecerPassword: Boolean(usuario?.permisos?.restablecerPassword),
    },
  };
}

function normalizarPagina(response) {
  const pagina = obtenerContenido(response) ?? {};

  return {
    content: Array.isArray(pagina.content)
      ? pagina.content.map(normalizarUsuario)
      : [],

    number: Number(pagina.number ?? 0),

    size: Number(pagina.size ?? 10),

    totalElements: Number(pagina.totalElements ?? 0),

    totalPages: Number(pagina.totalPages ?? 0),

    first: Boolean(pagina.first ?? pagina.number === 0),

    last: Boolean(pagina.last ?? pagina.number >= pagina.totalPages - 1),

    permisos: {
      crearUsuario: Boolean(pagina.permisos?.crearUsuario),
    },
  };
}

export const usersService = {
  async obtenerUsuarios({
    page = 0,
    size = 10,
    search = "",
    rol = "",
    signal,
  } = {}) {
    const params = new URLSearchParams();

    params.set("page", String(page));

    params.set("size", String(size));

    params.set("sort", "nombre,asc");

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (rol) {
      params.set("rol", rol);
    }

    const response = await apiClient(`/usuarios?${params.toString()}`, {
      method: "GET",
      signal,
    });

    return normalizarPagina(response);
  },

  async crearUsuario(datos) {
    const response = await apiClient("/usuarios", {
      method: "POST",
      body: datos,
    });

    return normalizarUsuario(obtenerContenido(response));
  },

  async actualizarUsuario(id, datos) {
    const response = await apiClient(`/usuarios/${id}`, {
      method: "PUT",
      body: datos,
    });

    return normalizarUsuario(obtenerContenido(response));
  },

  async restablecerPassword(id, password) {
    return apiClient(`/usuarios/${id}/password`, {
      method: "PATCH",

      body: {
        password,
      },
    });
  },

  async eliminarUsuario(id) {
    return apiClient(`/usuarios/${id}`, {
      method: "DELETE",
    });
  },
};
