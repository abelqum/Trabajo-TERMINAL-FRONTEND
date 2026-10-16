import { z } from "zod";

export const TASK_PRIORITIES = [
  {
    value: "URGENTE_IMPORTANTE",
    label: "Urgente e importante",
  },
  {
    value: "IMPORTANTE_NO_URGENTE",
    label: "Importante no urgente",
  },
  {
    value: "URGENTE_NO_IMPORTANTE",
    label: "Urgente no importante",
  },
  {
    value: "NO_URGENTE_NO_IMPORTANTE",
    label: "No urgente no importante",
  },
];

export const TASK_STATUSES = [
  {
    value: "PENDIENTE",
    label: "Por hacer",
  },
  {
    value: "EN_PROGRESO",
    label: "En progreso",
  },
  {
    value: "REVISION",
    label: "En revisión",
  },
  {
    value: "COMPLETADA",
    label: "Completada",
  },
];

export function obtenerNombrePrioridad(prioridad) {
  return (
    TASK_PRIORITIES.find((elemento) => elemento.value === prioridad)?.label ??
    prioridad ??
    "Sin prioridad"
  );
}

export function obtenerNombreEstado(estado) {
  return (
    TASK_STATUSES.find((elemento) => elemento.value === estado)?.label ??
    estado ??
    "Sin estado"
  );
}

function convertirFechaParaInput(fecha) {
  if (!fecha) {
    return "";
  }

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "";
  }

  const compensacion = valor.getTimezoneOffset() * 60_000;

  return new Date(valor.getTime() - compensacion).toISOString().slice(0, 16);
}

export function crearEstadoInicialTarea(tarea = null, usuarioActual = null) {
  if (!tarea) {
    return {
      titulo: "",
      descripcion: "",
      fechaLimite: "",
      prioridad: "IMPORTANTE_NO_URGENTE",

      asignadosIds: usuarioActual?.id ? [String(usuarioActual.id)] : [],
    };
  }

  return {
    titulo: tarea.titulo ?? "",

    descripcion: tarea.descripcion ?? "",

    fechaLimite: convertirFechaParaInput(tarea.fechaLimite),

    prioridad: tarea.prioridad ?? "IMPORTANTE_NO_URGENTE",

    asignadosIds: Array.isArray(tarea.asignados)
      ? tarea.asignados.map((usuario) => String(usuario.id))
      : [],
  };
}

const taskSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, "El título es obligatorio.")
    .max(150, "El título no puede superar los 150 caracteres."),

  descripcion: z
    .string()
    .trim()
    .max(1000, "La descripción no puede superar los 1000 caracteres."),

  fechaLimite: z.string(),

  prioridad: z.enum([
    "URGENTE_IMPORTANTE",
    "IMPORTANTE_NO_URGENTE",
    "URGENTE_NO_IMPORTANTE",
    "NO_URGENTE_NO_IMPORTANTE",
  ]),

  asignadosIds: z.array(z.string()).min(1, "Selecciona al menos una persona."),
});

export function parseTaskForm(values) {
  const resultado = taskSchema.safeParse(values);

  if (!resultado.success) {
    const errors = {};

    resultado.error.issues.forEach((issue) => {
      const campo = issue.path[0];

      if (campo && !errors[campo]) {
        errors[campo] = issue.message;
      }
    });

    return {
      success: false,
      errors,
      data: null,
    };
  }

  return {
    success: true,

    errors: {},

    data: {
      titulo: resultado.data.titulo.trim(),

      descripcion: resultado.data.descripcion.trim() || null,

      fechaLimite: resultado.data.fechaLimite
        ? new Date(resultado.data.fechaLimite).toISOString()
        : null,

      prioridad: resultado.data.prioridad,

      asignadosIds: resultado.data.asignadosIds.map(Number),
    },
  };
}
