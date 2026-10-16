import { z } from "zod";

export const INCOME_TYPES = [
  {
    value: "FACTURA",
    label: "Factura",
  },
  {
    value: "INGRESO",
    label: "Ingreso",
  },
];

export const INCOME_STATUSES = [
  {
    value: "PENDIENTE",
    label: "Pendiente",
  },
  {
    value: "PAGADO",
    label: "Pagado",
  },
  {
    value: "CANCELADO",
    label: "Cancelado",
  },
];

export const PAYMENT_METHODS = [
  {
    value: "TRANSFERENCIA",
    label: "Transferencia",
  },
  {
    value: "EFECTIVO",
    label: "Efectivo",
  },
  {
    value: "TARJETA",
    label: "Tarjeta",
  },
  {
    value: "CHEQUE",
    label: "Cheque",
  },
  {
    value: "OTRO",
    label: "Otro",
  },
];

function obtenerFechaActual() {
  const fecha = new Date();

  const fechaLocal = new Date(
    fecha.getTime() - fecha.getTimezoneOffset() * 60_000,
  );

  return fechaLocal.toISOString().slice(0, 10);
}

function redondearDinero(valor) {
  return Math.round((Number(valor) + Number.EPSILON) * 100) / 100;
}

export function calcularImportes(total, incluyeIva) {
  const totalNumerico = Number(total);

  if (!Number.isFinite(totalNumerico) || totalNumerico <= 0) {
    return {
      subtotal: 0,
      iva: 0,
      total: 0,
    };
  }

  const totalRedondeado = redondearDinero(totalNumerico);

  if (!incluyeIva) {
    return {
      subtotal: totalRedondeado,
      iva: 0,
      total: totalRedondeado,
    };
  }

  const subtotal = redondearDinero(totalRedondeado / 1.16);

  const iva = redondearDinero(totalRedondeado - subtotal);

  return {
    subtotal,
    iva,
    total: totalRedondeado,
  };
}

export function crearEstadoInicialIngreso(ingreso = null) {
  const hoy = obtenerFechaActual();

  if (!ingreso) {
    return {
      tipoRegistro: "FACTURA",
      clienteId: "",
      folio: "",
      concepto: "",
      fecha: hoy,
      total: "",
      incluyeIva: true,
      estado: "PENDIENTE",
      fechaPago: "",
      formaPago: "",
      comentarios: "",
    };
  }

  return {
    tipoRegistro: ingreso.tipoRegistro ?? "FACTURA",

    clienteId: String(ingreso.cliente?.id ?? ingreso.clienteId ?? ""),

    folio: ingreso.folio ?? "",

    concepto: ingreso.concepto ?? "",

    fecha: ingreso.fecha ?? hoy,

    total:
      ingreso.total !== undefined && ingreso.total !== null
        ? String(ingreso.total)
        : "",

    incluyeIva: ingreso.incluyeIva ?? Number(ingreso.iva ?? 0) > 0,

    estado: ingreso.estado ?? "PENDIENTE",

    fechaPago: ingreso.fechaPago ?? "",

    formaPago: ingreso.formaPago ?? "",

    comentarios: ingreso.comentarios ?? "",
  };
}

const incomeSchema = z
  .object({
    tipoRegistro: z.enum(["FACTURA", "INGRESO"]),

    clienteId: z.string().min(1, "Selecciona un cliente."),

    folio: z
      .string()
      .trim()
      .max(50, "El folio no puede superar los 50 caracteres."),

    concepto: z
      .string()
      .trim()
      .max(200, "El concepto no puede superar los 200 caracteres."),

    fecha: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Selecciona una fecha válida."),

    total: z.string().refine((valor) => {
      const numero = Number(valor);

      return Number.isFinite(numero) && numero > 0;
    }, "El total debe ser mayor que cero."),

    incluyeIva: z.boolean(),

    estado: z.enum(["PENDIENTE", "PAGADO", "CANCELADO"]),

    fechaPago: z.string(),

    formaPago: z.string(),

    comentarios: z
      .string()
      .trim()
      .max(500, "Los comentarios no pueden superar los 500 caracteres."),
  })
  .superRefine((datos, contexto) => {
    if (datos.tipoRegistro === "FACTURA" && !datos.folio.trim()) {
      contexto.addIssue({
        code: "custom",
        path: ["folio"],
        message: "El folio es obligatorio para una factura.",
      });
    }

    if (datos.tipoRegistro === "INGRESO" && !datos.concepto.trim()) {
      contexto.addIssue({
        code: "custom",
        path: ["concepto"],
        message: "Indica el concepto del ingreso.",
      });
    }

    if (datos.estado === "PAGADO") {
      if (!datos.fechaPago) {
        contexto.addIssue({
          code: "custom",
          path: ["fechaPago"],
          message: "Indica la fecha de pago.",
        });
      }

      if (!datos.formaPago) {
        contexto.addIssue({
          code: "custom",
          path: ["formaPago"],
          message: "Selecciona una forma de pago.",
        });
      }

      if (datos.fechaPago && datos.fecha && datos.fechaPago < datos.fecha) {
        contexto.addIssue({
          code: "custom",
          path: ["fechaPago"],
          message:
            "La fecha de pago no puede ser anterior a la fecha del registro.",
        });
      }
    }
  });

export function parseIncomeForm(values) {
  const valoresNormalizados = {
    ...values,

    estado: values.tipoRegistro === "INGRESO" ? "PAGADO" : values.estado,
  };

  const resultado = incomeSchema.safeParse(valoresNormalizados);

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

  const datos = resultado.data;

  const clienteId = Number(datos.clienteId);

  const total = redondearDinero(Number(datos.total));

  return {
    success: true,

    errors: {},

    data: {
      tipoRegistro: datos.tipoRegistro,

      clienteId,

      folio:
        datos.tipoRegistro === "FACTURA"
          ? datos.folio.trim().toUpperCase()
          : null,

      concepto: datos.concepto.trim() || null,

      fecha: datos.fecha,

      total,

      incluyeIva: datos.incluyeIva,

      estado: datos.tipoRegistro === "INGRESO" ? "PAGADO" : datos.estado,

      fechaPago:
        datos.estado === "PAGADO" || datos.tipoRegistro === "INGRESO"
          ? datos.fechaPago
          : null,

      formaPago:
        datos.estado === "PAGADO" || datos.tipoRegistro === "INGRESO"
          ? datos.formaPago
          : null,

      comentarios: datos.comentarios.trim() || null,
    },
  };
}
