import { z } from "zod";

export const CONFIG_CATALOGS = [
  {
    value: "categorias",
    label: "Categorías",
  },
  {
    value: "proveedores",
    label: "Proveedores",
    extraField: "enlace",
  },
  {
    value: "marcas",
    label: "Marcas",
  },
  {
    value: "unidades-medida",
    label: "Unidades de medida",
  },
  {
    value: "almacenes",
    label: "Almacenes / Estantes",
  },
  {
    value: "condiciones",
    label: "Condiciones",
    extraField: "permiteActualizarPrecio",
  },
  {
    value: "medidas",
    label: "Medidas",
  },
];

export function obtenerCatalogoConfiguracion(tipo) {
  return CONFIG_CATALOGS.find((catalogo) => catalogo.value === tipo);
}

const profileSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(150, "El nombre es demasiado largo."),
});

export function parseProfileForm(values) {
  const resultado = profileSchema.safeParse(values);

  if (!resultado.success) {
    return {
      success: false,
      errors: {
        nombre: resultado.error.issues[0]?.message,
      },
      data: null,
    };
  }

  return {
    success: true,
    errors: {},
    data: {
      nombre: resultado.data.nombre.trim(),
    },
  };
}

const passwordSchema = z
  .object({
    passwordActual: z.string().min(1, "Ingresa tu contraseña actual."),

    nuevaPassword: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres.")
      .max(100, "La contraseña es demasiado larga."),

    confirmarPassword: z.string(),
  })
  .refine((datos) => datos.nuevaPassword === datos.confirmarPassword, {
    path: ["confirmarPassword"],
    message: "Las contraseñas no coinciden.",
  });

export function parsePasswordChange(values) {
  const resultado = passwordSchema.safeParse(values);

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
      passwordActual: resultado.data.passwordActual,

      nuevaPassword: resultado.data.nuevaPassword,
    },
  };
}

const catalogSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(150, "El nombre es demasiado largo."),

  enlace: z.string().trim().optional(),

  permiteActualizarPrecio: z.boolean().optional(),
});

export function parseCatalogForm(values, catalogo) {
  const resultado = catalogSchema.safeParse(values);

  if (!resultado.success) {
    return {
      success: false,
      errors: {
        nombre: resultado.error.issues[0]?.message,
      },
      data: null,
    };
  }

  if (catalogo.extraField === "enlace" && resultado.data.enlace) {
    try {
      new URL(resultado.data.enlace);
    } catch {
      return {
        success: false,
        errors: {
          enlace: "Ingresa un enlace válido.",
        },
        data: null,
      };
    }
  }

  const payload = {
    nombre: resultado.data.nombre.trim(),
  };

  if (catalogo.extraField === "enlace") {
    payload.enlace = resultado.data.enlace?.trim() || null;
  }

  if (catalogo.extraField === "permiteActualizarPrecio") {
    payload.permiteActualizarPrecio = Boolean(
      resultado.data.permiteActualizarPrecio,
    );
  }

  return {
    success: true,
    errors: {},
    data: payload,
  };
}

export function crearEstadoKit(kit = null) {
  if (!kit) {
    return {
      descripcion: "",
      categoriaId: "",
      almacenId: "",
      fila: "",
      precioUnitario: "0",

      componentes: [
        {
          productoId: "",
          cantidadNecesaria: "1",
        },
      ],
    };
  }

  return {
    descripcion: kit.descripcion ?? "",

    categoriaId: String(kit.categoria?.id ?? ""),

    almacenId: String(kit.almacen?.id ?? ""),

    fila: kit.fila ?? "",

    precioUnitario: String(kit.precioUnitario ?? 0),

    componentes: kit.componentes?.length
      ? kit.componentes.map((componente) => ({
          productoId: String(componente.producto?.id ?? componente.productoId),

          cantidadNecesaria: String(componente.cantidadNecesaria),
        }))
      : [
          {
            productoId: "",
            cantidadNecesaria: "1",
          },
        ],
  };
}

const kitSchema = z.object({
  descripcion: z
    .string()
    .trim()
    .min(1, "El nombre del kit es obligatorio.")
    .max(200, "El nombre es demasiado largo."),

  categoriaId: z.string(),

  almacenId: z.string(),

  fila: z.string().trim().max(50, "La ubicación es demasiado larga."),

  precioUnitario: z.string().refine((valor) => {
    const numero = Number(valor);

    return Number.isFinite(numero) && numero >= 0;
  }, "El precio no puede ser negativo."),

  componentes: z
    .array(
      z.object({
        productoId: z.string(),

        cantidadNecesaria: z.string(),
      }),
    )
    .min(1, "Agrega al menos un componente."),
});

export function parseKitForm(values) {
  const resultado = kitSchema.safeParse(values);

  if (!resultado.success) {
    return {
      success: false,
      errors: {
        general: resultado.error.issues[0]?.message,
      },
      data: null,
    };
  }

  const componentes = resultado.data.componentes
    .filter((componente) => componente.productoId)
    .map((componente) => ({
      productoId: Number(componente.productoId),

      cantidadNecesaria: Number(componente.cantidadNecesaria),
    }));

  if (!componentes.length) {
    return {
      success: false,
      errors: {
        general: "Selecciona al menos un componente.",
      },
      data: null,
    };
  }

  const productosUnicos = new Set(
    componentes.map((componente) => componente.productoId),
  );

  if (productosUnicos.size !== componentes.length) {
    return {
      success: false,
      errors: {
        general: "Un producto no puede repetirse dentro del mismo kit.",
      },
      data: null,
    };
  }

  const cantidadInvalida = componentes.some(
    (componente) =>
      !Number.isFinite(componente.cantidadNecesaria) ||
      componente.cantidadNecesaria <= 0,
  );

  if (cantidadInvalida) {
    return {
      success: false,
      errors: {
        general:
          "Las cantidades de los componentes deben ser mayores que cero.",
      },
      data: null,
    };
  }

  return {
    success: true,
    errors: {},

    data: {
      descripcion: resultado.data.descripcion.trim(),

      categoriaId: resultado.data.categoriaId
        ? Number(resultado.data.categoriaId)
        : null,

      almacenId: resultado.data.almacenId
        ? Number(resultado.data.almacenId)
        : null,

      fila: resultado.data.fila.trim() || null,

      precioUnitario: Number(resultado.data.precioUnitario),

      componentes,
    },
  };
}
