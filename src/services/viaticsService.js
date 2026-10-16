import imageCompression from "browser-image-compression";

import { apiClient } from "@/lib/api/apiClient";

function obtenerContenido(response) {
  return response?.data ?? response;
}

function normalizarUsuario(usuario) {
  return {
    id: usuario?.id ?? null,

    nombre: usuario?.nombre ?? "",

    email: usuario?.email ?? "",

    rol: String(usuario?.rol ?? "").toLowerCase(),
  };
}

function normalizarPresupuesto(presupuesto) {
  const resultado = {
    alimentos: Number(presupuesto?.alimentos ?? 0),

    gasolina: Number(presupuesto?.gasolina ?? 0),

    casetas: Number(presupuesto?.casetas ?? 0),

    hospedaje: Number(presupuesto?.hospedaje ?? 0),

    material: Number(presupuesto?.material ?? 0),

    otros: Number(presupuesto?.otros ?? 0),
  };

  resultado.total = Number(
    presupuesto?.total ??
      Object.values(resultado).reduce((total, valor) => total + valor, 0),
  );

  return resultado;
}

function normalizarPermisos(permisos) {
  return {
    editar: Boolean(permisos?.editar),

    eliminar: Boolean(permisos?.eliminar),

    registrarGastos: Boolean(permisos?.registrarGastos),

    revisarGastos: Boolean(permisos?.revisarGastos),

    finalizar: Boolean(permisos?.finalizar),
  };
}

function normalizarGasto(gasto) {
  return {
    id: gasto?.id ?? null,

    categoria: gasto?.categoria ?? "",

    descripcion: gasto?.descripcion ?? "",

    monto: Number(gasto?.monto ?? 0),

    fecha: gasto?.fecha ?? null,

    estatus: gasto?.estatus ?? "PENDIENTE",

    motivoRechazo: gasto?.motivoRechazo ?? null,

    comprobanteUrl: gasto?.comprobanteUrl ?? null,

    creadoPor: gasto?.creadoPor ? normalizarUsuario(gasto.creadoPor) : null,

    puedeEliminar: Boolean(gasto?.puedeEliminar),

    creadoEn: gasto?.creadoEn ?? null,
  };
}

export function normalizarViaje(viaje) {
  return {
    id: viaje?.id ?? null,

    nombre: viaje?.nombre ?? "",

    destino: viaje?.destino ?? "",

    fechaInicio: viaje?.fechaInicio ?? null,

    fechaFin: viaje?.fechaFin ?? null,

    dias: Number(viaje?.dias ?? 0),

    estatus: viaje?.estatus ?? "ACTIVO",

    presupuesto: normalizarPresupuesto(viaje?.presupuesto),

    usuarios: Array.isArray(viaje?.usuarios)
      ? viaje.usuarios.map(normalizarUsuario)
      : [],

    resumen: {
      gastadoAprobado: Number(viaje?.resumen?.gastadoAprobado ?? 0),

      saldo: Number(viaje?.resumen?.saldo ?? 0),

      gastosPendientes: Number(viaje?.resumen?.gastosPendientes ?? 0),

      gastosAprobados: Number(viaje?.resumen?.gastosAprobados ?? 0),

      gastosRechazados: Number(viaje?.resumen?.gastosRechazados ?? 0),
    },

    gastos: Array.isArray(viaje?.gastos)
      ? viaje.gastos.map(normalizarGasto)
      : [],

    permisos: normalizarPermisos(viaje?.permisos),
  };
}

function normalizarPagina(response) {
  const data = obtenerContenido(response) ?? {};

  return {
    content: Array.isArray(data.content)
      ? data.content.map(normalizarViaje)
      : [],

    number: Number(data.number ?? 0),

    size: Number(data.size ?? 9),

    totalElements: Number(data.totalElements ?? 0),

    totalPages: Number(data.totalPages ?? 0),

    permisos: {
      crearViaje: Boolean(data.permisos?.crearViaje),
    },
  };
}

async function optimizarComprobante(archivo, indice) {
  const comprimido = await imageCompression(archivo, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.8,
  });

  return new File([comprimido], `ticket_${Date.now()}_${indice}.webp`, {
    type: comprimido.type || "image/webp",
  });
}

export const viaticsService = {
  async obtenerViajes({ page = 0, size = 9, signal } = {}) {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      sort: "fechaInicio,desc",
    });

    const response = await apiClient(`/viaticos?${params.toString()}`, {
      method: "GET",
      signal,
    });

    return normalizarPagina(response);
  },

  async obtenerViaje(id, { signal } = {}) {
    const response = await apiClient(`/viaticos/${id}`, {
      method: "GET",
      signal,
    });

    return normalizarViaje(obtenerContenido(response));
  },

  async obtenerUsuariosAsignables({ signal } = {}) {
    const response = await apiClient(
      "/usuarios/opciones?asignablesViaje=true",
      {
        method: "GET",
        signal,
      },
    );

    const usuarios = obtenerContenido(response);

    return Array.isArray(usuarios) ? usuarios.map(normalizarUsuario) : [];
  },

  async crearViaje(datos) {
    const response = await apiClient("/viaticos", {
      method: "POST",
      body: datos,
    });

    return normalizarViaje(obtenerContenido(response));
  },

  async actualizarViaje(id, datos) {
    const response = await apiClient(`/viaticos/${id}`, {
      method: "PUT",
      body: datos,
    });

    return normalizarViaje(obtenerContenido(response));
  },

  eliminarViaje(id) {
    return apiClient(`/viaticos/${id}`, {
      method: "DELETE",
    });
  },

  eliminarComprobantes(id) {
    return apiClient(`/viaticos/${id}/comprobantes`, {
      method: "DELETE",
    });
  },

  async registrarGastos(viajeId, gastos) {
    const archivos = [];
    const datos = [];

    for (let indice = 0; indice < gastos.length; indice += 1) {
      const gasto = gastos[indice];

      let comprobanteIndice = null;

      if (gasto.archivo) {
        const archivo = await optimizarComprobante(gasto.archivo, indice);

        comprobanteIndice = archivos.length;

        archivos.push(archivo);
      }

      datos.push({
        categoria: gasto.categoria,

        descripcion: gasto.descripcion,

        monto: gasto.monto,

        fecha: gasto.fecha,

        comprobanteIndice,
      });
    }

    const formData = new FormData();

    formData.append(
      "datos",
      new Blob([JSON.stringify(datos)], {
        type: "application/json",
      }),
    );

    archivos.forEach((archivo) => {
      formData.append("comprobantes", archivo);
    });

    const response = await apiClient(`/viaticos/${viajeId}/gastos/lote`, {
      method: "POST",
      body: formData,
    });

    return obtenerContenido(response);
  },

  eliminarGasto(viajeId, gastoId) {
    return apiClient(`/viaticos/${viajeId}/gastos/${gastoId}`, {
      method: "DELETE",
    });
  },

  cambiarEstadoGasto(viajeId, gastoId, { estatus, motivoRechazo = null }) {
    return apiClient(`/viaticos/${viajeId}/gastos/${gastoId}/estado`, {
      method: "PATCH",

      body: {
        estatus,
        motivoRechazo,
      },
    });
  },

  finalizarViaje(id) {
    return apiClient(`/viaticos/${id}/finalizar`, {
      method: "PATCH",
    });
  },
};
