import { z } from "zod";

export const VIATIC_CATEGORIES = [
  {
    value: "ALIMENTOS",
    label: "Comidas / Alimentos",
  },
  {
    value: "GASOLINA",
    label: "Gasolina",
  },
  {
    value: "CASETAS",
    label: "Casetas",
  },
  {
    value: "HOSPEDAJE",
    label: "Hospedaje",
  },
  {
    value: "MATERIAL",
    label: "Material",
  },
  {
    value: "OTROS",
    label: "Otros",
  },
];

export const VIATIC_EXPENSE_STATUSES = ["PENDIENTE", "APROBADO", "RECHAZADO"];

function obtenerFechaActual() {
  const fecha = new Date();

  const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60_000);

  return local.toISOString().slice(0, 10);
}

function redondearDinero(valor) {
  return Math.round((Number(valor || 0) + Number.EPSILON) * 100) / 100;
}

export function calcularDiasViaje(fechaInicio, fechaFin) {
  if (!fechaInicio || !fechaFin) {
    return 0;
  }

  const inicio = new Date(`${fechaInicio}T00:00:00`);

  const fin = new Date(`${fechaFin}T00:00:00`);

  if (
    Number.isNaN(inicio.getTime()) ||
    Number.isNaN(fin.getTime()) ||
    fin < inicio
  ) {
    return 0;
  }

  const diferencia = fin.getTime() - inicio.getTime();

  return Math.floor(diferencia / 86_400_000) + 1;
}

export function calcularPresupuestoTotal(presupuesto) {
  return redondearDinero(
    Number(presupuesto.alimentos || 0) +
      Number(presupuesto.gasolina || 0) +
      Number(presupuesto.casetas || 0) +
      Number(presupuesto.hospedaje || 0) +
      Number(presupuesto.material || 0) +
      Number(presupuesto.otros || 0),
  );
}

export function obtenerNombreCategoriaViatico(categoria) {
  return (
    VIATIC_CATEGORIES.find((elemento) => elemento.value === categoria)?.label ??
    categoria ??
    "Sin categoría"
  );
}

export function crearEstadoInicialViaje(viaje = null) {
  const hoy = obtenerFechaActual();

  if (!viaje) {
    return {
      nombre: "",
      destino: "",
      fechaInicio: hoy,
      fechaFin: hoy,

      usuariosIds: [],

      presupuesto: {
        alimentos: "",
        gasolina: "",
        casetas: "",
        hospedaje: "",
        material: "",
        otros: "",
      },
    };
  }

  return {
    nombre: viaje.nombre ?? "",
    destino: viaje.destino ?? "",

    fechaInicio: viaje.fechaInicio ?? hoy,

    fechaFin: viaje.fechaFin ?? hoy,

    usuariosIds: Array.isArray(viaje.usuarios)
      ? viaje.usuarios.map((usuario) => String(usuario.id))
      : [],

    presupuesto: {
      alimentos: String(viaje.presupuesto?.alimentos ?? 0),

      gasolina: String(viaje.presupuesto?.gasolina ?? 0),

      casetas: String(viaje.presupuesto?.casetas ?? 0),

      hospedaje: String(viaje.presupuesto?.hospedaje ?? 0),

      material: String(viaje.presupuesto?.material ?? 0),

      otros: String(viaje.presupuesto?.otros ?? 0),
    },
  };
}

const travelSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(1, "El nombre del viaje es obligatorio.")
      .max(150, "El nombre no puede superar los 150 caracteres."),

    destino: z
      .string()
      .trim()
      .min(1, "El destino es obligatorio.")
      .max(150, "El destino no puede superar los 150 caracteres."),

    fechaInicio: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Selecciona una fecha válida."),

    fechaFin: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Selecciona una fecha válida."),

    usuariosIds: z.array(z.string()).min(1, "Asigna al menos a una persona."),

    presupuesto: z.object({
      alimentos: z.string(),
      gasolina: z.string(),
      casetas: z.string(),
      hospedaje: z.string(),
      material: z.string(),
      otros: z.string(),
    }),
  })
  .superRefine((datos, contexto) => {
    if (datos.fechaFin < datos.fechaInicio) {
      contexto.addIssue({
        code: "custom",
        path: ["fechaFin"],
        message:
          "La fecha de retorno no puede ser anterior a la fecha de salida.",
      });
    }

    Object.entries(datos.presupuesto).forEach(([categoria, valor]) => {
      const numero = Number(valor || 0);

      if (!Number.isFinite(numero) || numero < 0) {
        contexto.addIssue({
          code: "custom",
          path: ["presupuesto", categoria],
          message: "El presupuesto no puede ser negativo.",
        });
      }
    });
  });

export function parseTravelForm(values) {
  const resultado = travelSchema.safeParse(values);

  if (!resultado.success) {
    const errors = {};

    resultado.error.issues.forEach((issue) => {
      const clave = issue.path.join(".");

      if (!errors[clave]) {
        errors[clave] = issue.message;
      }
    });

    return {
      success: false,
      errors,
      data: null,
    };
  }

  const datos = resultado.data;

  return {
    success: true,
    errors: {},

    data: {
      nombre: datos.nombre.trim(),

      destino: datos.destino.trim(),

      fechaInicio: datos.fechaInicio,

      fechaFin: datos.fechaFin,

      usuariosIds: datos.usuariosIds.map((id) => Number(id)),

      presupuesto: {
        alimentos: redondearDinero(datos.presupuesto.alimentos),

        gasolina: redondearDinero(datos.presupuesto.gasolina),

        casetas: redondearDinero(datos.presupuesto.casetas),

        hospedaje: redondearDinero(datos.presupuesto.hospedaje),

        material: redondearDinero(datos.presupuesto.material),

        otros: redondearDinero(datos.presupuesto.otros),
      },
    },
  };
}

export function crearFilaGasto() {
  return {
    idTemporal: `${Date.now()}-${Math.random()}`,

    categoria: "",
    descripcion: "",
    monto: "",
    fecha: obtenerFechaActual(),

    archivo: null,
    preview: null,
  };
}

export function validarGastosViaje(gastos) {
  const errors = {};

  gastos.forEach((gasto, index) => {
    if (!gasto.categoria) {
      errors[`${index}.categoria`] = "Selecciona una categoría.";
    }

    if (!gasto.descripcion.trim()) {
      errors[`${index}.descripcion`] = "La descripción es obligatoria.";
    }

    const monto = Number(gasto.monto);

    if (!Number.isFinite(monto) || monto <= 0) {
      errors[`${index}.monto`] = "El monto debe ser mayor que cero.";
    }

    if (!gasto.fecha) {
      errors[`${index}.fecha`] = "Selecciona la fecha.";
    }
  });

  if (Object.keys(errors).length) {
    return {
      success: false,
      errors,
      data: null,
    };
  }

  return {
    success: true,
    errors: {},

    data: gastos.map((gasto) => ({
      categoria: gasto.categoria,

      descripcion: gasto.descripcion.trim(),

      monto: redondearDinero(gasto.monto),

      fecha: gasto.fecha,

      archivo: gasto.archivo,
    })),
  };
}
