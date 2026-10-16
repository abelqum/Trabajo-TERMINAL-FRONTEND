import { apiClient, resolverApiUrl } from "@/lib/api/apiClient";

function obtenerContenido(response) {
  return response?.data ?? response;
}

export function normalizarEmpresa(empresa) {
  if (!empresa) {
    return null;
  }

  return {
    id: empresa.id ?? null,

    nombre: empresa.nombre ?? "",

    logoUrl: resolverApiUrl(empresa.logoUrl),

    colorPrincipal: empresa.colorPrincipal || "#1D4ED8",

    colorSidebar: empresa.colorSidebar || "#172554",
  };
}

function normalizarUsuario(response) {
  const usuario = obtenerContenido(response);

  if (!usuario) {
    throw new Error("El servidor no devolvió los datos del usuario.");
  }

  return {
    id: usuario.id,

    nombre: usuario.nombre ?? "",

    email: usuario.email ?? "",

    rol: String(usuario.rol ?? "").toLowerCase(),

    empresa: normalizarEmpresa(usuario.empresa),
  };
}

export const authService = {
  async obtenerUsuarioActual({ signal } = {}) {
    const response = await apiClient("/auth/me", {
      method: "GET",
      signal,
    });

    return normalizarUsuario(response);
  },

  async iniciarSesion(email, password) {
    const response = await apiClient("/auth/login", {
      method: "POST",

      body: {
        email,
        password,
      },
    });

    return normalizarUsuario(response);
  },

  async registrarEmpresa({
    empresa,
    nombre,
    email,
    password,
    confirmarPassword,
  }) {
    const response = await apiClient("/auth/registro", {
      method: "POST",

      body: {
        empresa,
        nombre,
        email,
        password,
        confirmarPassword,
      },
    });

    return normalizarUsuario(response);
  },

  async cerrarSesion() {
    return apiClient("/auth/logout", {
      method: "POST",
    });
  },
};
