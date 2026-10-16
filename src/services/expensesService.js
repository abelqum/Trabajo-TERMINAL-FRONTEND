import { apiClient } from "@/lib/api/apiClient";

function obtenerContenido(response) {
  return response?.data ?? response;
}

function normalizarEgreso(egreso) {
  return {
    id: egreso?.id ?? null,

    origen: egreso?.origen ?? "REGISTRADO",

    concepto: egreso?.concepto ?? null,

    categoria: egreso?.categoria ?? null,

    monto: Number(egreso?.monto ?? 0),

    fecha: egreso?.fecha ?? null,

    descripcion: egreso?.descripcion ?? null,

    viaje: egreso?.viaje
      ? {
          id: egreso.viaje.id ?? null,

          nombre: egreso.viaje.nombre ?? "",

          destino: egreso.viaje.destino ?? "",
        }
      : null,
  };
}

function normalizarMes(mes) {
  return {
    periodo: mes?.periodo ?? "",

    anio: Number(mes?.anio ?? 0),

    mes: Number(mes?.mes ?? 0),

    totalRegistrados: Number(mes?.totalRegistrados ?? 0),

    totalViaticos: Number(mes?.totalViaticos ?? 0),

    total: Number(mes?.total ?? 0),

    cantidadRegistrados: Number(mes?.cantidadRegistrados ?? 0),

    cantidadViaticos: Number(mes?.cantidadViaticos ?? 0),

    egresos: Array.isArray(mes?.egresos)
      ? mes.egresos.map(normalizarEgreso)
      : [],
  };
}

function normalizarConsulta(response) {
  const data = obtenerContenido(response) ?? {};

  return {
    resumen: {
      total: Number(data.resumen?.total ?? 0),

      totalRegistrados: Number(data.resumen?.totalRegistrados ?? 0),

      totalViaticos: Number(data.resumen?.totalViaticos ?? 0),

      cantidadRegistrados: Number(data.resumen?.cantidadRegistrados ?? 0),

      cantidadViaticos: Number(data.resumen?.cantidadViaticos ?? 0),
    },

    meses: Array.isArray(data.meses) ? data.meses.map(normalizarMes) : [],
  };
}

export const expensesService = {
  async obtenerEgresos({ desde, hasta, signal }) {
    const params = new URLSearchParams({
      desde,
      hasta,
    });

    const response = await apiClient(`/egresos?${params.toString()}`, {
      method: "GET",
      signal,
    });

    return normalizarConsulta(response);
  },

  async crearEgreso(datos) {
    const response = await apiClient("/egresos", {
      method: "POST",
      body: datos,
    });

    return normalizarEgreso(obtenerContenido(response));
  },

  async actualizarEgreso(id, datos) {
    const response = await apiClient(`/egresos/${id}`, {
      method: "PUT",
      body: datos,
    });

    return normalizarEgreso(obtenerContenido(response));
  },

  eliminarEgreso(id) {
    return apiClient(`/egresos/${id}`, {
      method: "DELETE",
    });
  },
};
