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

function normalizarPermisos(permisos) {
  return {
    editar: Boolean(permisos?.editar),

    eliminar: Boolean(permisos?.eliminar),

    cambiarPrioridad: Boolean(permisos?.cambiarPrioridad),

    subirEvidencias: Boolean(permisos?.subirEvidencias),

    retroalimentar: Boolean(permisos?.retroalimentar),

    estadosPermitidos: Array.isArray(permisos?.estadosPermitidos)
      ? permisos.estadosPermitidos
      : [],
  };
}

export function normalizarTarea(tarea) {
  return {
    id: tarea?.id ?? null,

    titulo: tarea?.titulo ?? "",

    descripcion: tarea?.descripcion ?? "",

    fechaLimite: tarea?.fechaLimite ?? null,

    prioridad: tarea?.prioridad ?? "IMPORTANTE_NO_URGENTE",

    estado: tarea?.estado ?? "PENDIENTE",

    creador: tarea?.creador ? normalizarUsuario(tarea.creador) : null,

    asignados: Array.isArray(tarea?.asignados)
      ? tarea.asignados.map(normalizarUsuario)
      : [],

    retroalimentacion: tarea?.retroalimentacion ?? null,

    fechaRevision: tarea?.fechaRevision ?? null,

    fechaCompletada: tarea?.fechaCompletada ?? null,

    creadoEn: tarea?.creadoEn ?? null,

    actualizadoEn: tarea?.actualizadoEn ?? null,

    permisos: normalizarPermisos(tarea?.permisos),
  };
}

function normalizarRespuestaTareas(response) {
  const data = obtenerContenido(response) ?? {};

  return {
    tareas: Array.isArray(data.tareas) ? data.tareas.map(normalizarTarea) : [],

    permisos: {
      crearTarea: Boolean(data.permisos?.crearTarea),
    },
  };
}

function construirQueryFiltros({ filtroUsuario = "TODAS", estado = "TODOS" }) {
  const params = new URLSearchParams();

  if (filtroUsuario === "MIS_TAREAS") {
    params.set("alcance", "MIS_TAREAS");
  } else if (filtroUsuario === "ASIGNADAS_POR_MI") {
    params.set("alcance", "ASIGNADAS_POR_MI");
  } else if (filtroUsuario.startsWith("USUARIO:")) {
    params.set("alcance", "USUARIO");

    params.set("usuarioId", filtroUsuario.split(":")[1]);
  } else {
    params.set("alcance", "TODAS");
  }

  if (estado && estado !== "TODOS") {
    params.set("estado", estado);
  }

  return params.toString();
}

function normalizarEvidencia(evidencia) {
  return {
    id: evidencia?.id ?? null,

    url: evidencia?.url ?? "",

    nombreOriginal: evidencia?.nombreOriginal ?? "Evidencia",

    mimeType: evidencia?.mimeType ?? "image/webp",

    tamanoBytes: Number(evidencia?.tamanoBytes ?? 0),

    autor: evidencia?.autor ? normalizarUsuario(evidencia.autor) : null,

    puedeEliminar: Boolean(evidencia?.puedeEliminar),

    creadoEn: evidencia?.creadoEn ?? null,
  };
}

async function optimizarEvidencia(archivo, indice) {
  if (!archivo.type.startsWith("image/")) {
    throw new Error("Solo se permiten imágenes como evidencia.");
  }

  const comprimida = await imageCompression(archivo, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.78,
  });

  return new File([comprimida], `evidencia_${Date.now()}_${indice}.webp`, {
    type: comprimida.type || "image/webp",
  });
}

export const tasksService = {
  async obtenerTareas({
    filtroUsuario = "TODAS",
    estado = "TODOS",
    signal,
  } = {}) {
    const query = construirQueryFiltros({
      filtroUsuario,
      estado,
    });

    const response = await apiClient(`/tareas?${query}`, {
      method: "GET",
      signal,
    });

    return normalizarRespuestaTareas(response);
  },

  async obtenerTarea(id, { signal } = {}) {
    const response = await apiClient(`/tareas/${id}`, {
      method: "GET",
      signal,
    });

    return normalizarTarea(obtenerContenido(response));
  },

  async obtenerUsuariosAsignables({ signal } = {}) {
    const response = await apiClient(
      "/usuarios/opciones?asignablesTarea=true",
      {
        method: "GET",
        signal,
      },
    );

    const usuarios = obtenerContenido(response);

    return Array.isArray(usuarios) ? usuarios.map(normalizarUsuario) : [];
  },

  async crearTarea(datos) {
    const response = await apiClient("/tareas", {
      method: "POST",
      body: datos,
    });

    return normalizarTarea(obtenerContenido(response));
  },

  async actualizarTarea(id, datos) {
    const response = await apiClient(`/tareas/${id}`, {
      method: "PUT",
      body: datos,
    });

    return normalizarTarea(obtenerContenido(response));
  },

  async cambiarEstado(id, estado) {
    const response = await apiClient(`/tareas/${id}/estado`, {
      method: "PATCH",

      body: {
        estado,
      },
    });

    return normalizarTarea(obtenerContenido(response));
  },

  async moverTarea(id, { prioridad, estado }) {
    const response = await apiClient(`/tareas/${id}/mover`, {
      method: "PATCH",

      body: {
        prioridad,
        estado,
      },
    });

    return normalizarTarea(obtenerContenido(response));
  },

  async retroalimentar(id, comentario) {
    const response = await apiClient(`/tareas/${id}/retroalimentacion`, {
      method: "POST",

      body: {
        comentario,
      },
    });

    return normalizarTarea(obtenerContenido(response));
  },

  eliminarTarea(id) {
    return apiClient(`/tareas/${id}`, {
      method: "DELETE",
    });
  },

  async obtenerEvidencias(tareaId, { signal } = {}) {
    const response = await apiClient(`/tareas/${tareaId}/evidencias`, {
      method: "GET",
      signal,
    });

    const evidencias = obtenerContenido(response);

    return Array.isArray(evidencias) ? evidencias.map(normalizarEvidencia) : [];
  },

  async subirEvidencias(tareaId, archivosOriginales) {
    const archivos = Array.from(archivosOriginales ?? []);

    if (!archivos.length) {
      return [];
    }

    const optimizados = await Promise.all(
      archivos.map((archivo, indice) => optimizarEvidencia(archivo, indice)),
    );

    const formData = new FormData();

    optimizados.forEach((archivo) => {
      formData.append("archivos", archivo);
    });

    const response = await apiClient(`/tareas/${tareaId}/evidencias`, {
      method: "POST",
      body: formData,
    });

    const evidencias = obtenerContenido(response);

    return Array.isArray(evidencias) ? evidencias.map(normalizarEvidencia) : [];
  },

  eliminarEvidencia(tareaId, evidenciaId) {
    return apiClient(`/tareas/${tareaId}/evidencias/${evidenciaId}`, {
      method: "DELETE",
    });
  },
};
