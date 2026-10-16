import { apiClient } from "@/lib/api/apiClient";

function obtenerContenido(response) {
  return response?.data ?? response;
}

function crearQuery(parametros) {
  const query = new URLSearchParams();

  Object.entries(parametros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== "") {
      query.set(clave, String(valor));
    }
  });

  return query.toString();
}

export const dashboardService = {
  async obtenerInicio({ signal } = {}) {
    const response = await apiClient("/dashboard/inicio", {
      method: "GET",
      signal,
    });

    return obtenerContenido(response);
  },

  async obtenerEvolucionMensual(anio, { signal } = {}) {
    const query = crearQuery({
      anio,
    });

    const response = await apiClient(`/dashboard/financiero/mensual?${query}`, {
      method: "GET",
      signal,
    });

    return obtenerContenido(response);
  },

  async obtenerResumenPeriodo(desde, hasta, { signal } = {}) {
    const query = crearQuery({
      desde,
      hasta,
    });

    const response = await apiClient(`/dashboard/financiero/resumen?${query}`, {
      method: "GET",
      signal,
    });

    return {
      ...obtenerContenido(response),
      desde,
      hasta,
    };
  },

  async obtenerCategoriasEgresos(desde, hasta, { signal } = {}) {
    const query = crearQuery({
      desde,
      hasta,
    });

    const response = await apiClient(
      `/dashboard/financiero/categorias-egresos?${query}`,
      {
        method: "GET",
        signal,
      },
    );

    return {
      desde,
      hasta,
      datos: obtenerContenido(response)?.datos ?? [],
    };
  },
};
