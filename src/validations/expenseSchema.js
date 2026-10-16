import { z } from "zod";

export const EXPENSE_CATEGORIES = [
  {
    value: "OPERACION",
    label: "Operación",
  },
  {
    value: "SERVICIOS",
    label: "Servicios",
  },
  {
    value: "RENTA",
    label: "Renta",
  },
  {
    value: "NOMINA",
    label: "Nómina",
  },
  {
    value: "COMPRAS",
    label: "Compras",
  },
  {
    value: "MANTENIMIENTO",
    label: "Mantenimiento",
  },
  {
    value: "IMPUESTOS",
    label: "Impuestos",
  },
  {
    value: "PUBLICIDAD",
    label: "Publicidad",
  },
  {
    value: "TRANSPORTE",
    label: "Transporte",
  },
  {
    value: "OTROS",
    label: "Otros",
  },
];

function obtenerFechaActual() {
  const fecha = new Date();

  const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60_000);

  return local.toISOString().slice(0, 10);
}

export function obtenerNombreCategoria(categoria) {
  return (
    EXPENSE_CATEGORIES.find((elemento) => elemento.value === categoria)
      ?.label ??
    categoria ??
    "Sin categoría"
  );
}

export function crearEstadoInicialEgreso(egreso = null, fechaInicial = null) {
  if (!egreso) {
    return {
      concepto: "",
      categoria: "OPERACION",
      monto: "",
      fecha: fechaInicial || obtenerFechaActual(),
      descripcion: "",
    };
  }

  return {
    concepto: egreso.concepto ?? "",

    categoria: egreso.categoria ?? "OPERACION",

    monto:
      egreso.monto !== undefined && egreso.monto !== null
        ? String(egreso.monto)
        : "",

    fecha: egreso.fecha ?? obtenerFechaActual(),

    descripcion: egreso.descripcion ?? "",
  };
}

const expenseSchema = z.object({
  concepto: z
    .string()
    .trim()
    .min(1, "El concepto es obligatorio.")
    .max(150, "El concepto no puede superar los 150 caracteres."),

  categoria: z.enum(EXPENSE_CATEGORIES.map((categoria) => categoria.value)),

  monto: z.string().refine((valor) => {
    const numero = Number(valor);

    return Number.isFinite(numero) && numero > 0;
  }, "El monto debe ser mayor que cero."),

  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Selecciona una fecha válida."),

  descripcion: z
    .string()
    .trim()
    .max(500, "La descripción no puede superar los 500 caracteres."),
});

export function parseExpenseForm(values) {
  const resultado = expenseSchema.safeParse(values);

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
      concepto: resultado.data.concepto.trim(),

      categoria: resultado.data.categoria,

      monto:
        Math.round((Number(resultado.data.monto) + Number.EPSILON) * 100) / 100,

      fecha: resultado.data.fecha,

      descripcion: resultado.data.descripcion.trim() || null,
    },
  };
}
