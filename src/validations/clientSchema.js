import { z } from "zod";

const RFC_REGEX = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function convertirLista(valor) {
  return String(valor ?? "")
    .split(",")
    .map((elemento) => elemento.trim())
    .filter(Boolean);
}

export const clientSchema = z.object({
  razonSocial: z
    .string()
    .trim()
    .min(1, "La razón social es obligatoria.")
    .max(150, "La razón social no puede superar los 150 caracteres."),

  rfc: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, "El RFC es obligatorio.")
    .regex(RFC_REGEX, "El RFC no tiene un formato válido."),

  telefonos: z
    .string()
    .optional()
    .default("")
    .refine((valor) => {
      const telefonos = convertirLista(valor);

      return telefonos.every((telefono) =>
        /^[0-9+\-\s()]{7,20}$/.test(telefono),
      );
    }, "Uno o más teléfonos no tienen un formato válido."),

  correos: z
    .string()
    .optional()
    .default("")
    .refine((valor) => {
      const correos = convertirLista(valor);

      return correos.every((correo) => EMAIL_REGEX.test(correo));
    }, "Uno o más correos electrónicos no son válidos."),
});

export function parseClientForm(values) {
  const resultado = clientSchema.safeParse(values);

  if (!resultado.success) {
    const errores = {};

    resultado.error.issues.forEach((issue) => {
      const campo = issue.path[0];

      if (campo && !errores[campo]) {
        errores[campo] = issue.message;
      }
    });

    return {
      success: false,
      errors: errores,
      data: null,
    };
  }

  return {
    success: true,
    errors: {},
    data: {
      razonSocial: resultado.data.razonSocial.trim(),

      rfc: resultado.data.rfc.trim().toUpperCase(),

      telefonos: convertirLista(resultado.data.telefonos),

      correos: convertirLista(resultado.data.correos),
    },
  };
}
