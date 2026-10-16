import { z } from "zod";

export const USER_ROLES = [
  {
    value: "empleado",
    label: "Empleado",
    description: "Acceso operativo limitado",
  },
  {
    value: "editor",
    label: "Editor",
    description: "Acceso administrativo parcial",
  },
  {
    value: "admin",
    label: "Administrador",
    description: "Control completo del sistema",
  },
];

export function obtenerNombreRol(rol) {
  return (
    USER_ROLES.find((elemento) => elemento.value === rol)?.label ??
    rol ??
    "Sin rol"
  );
}

export function crearEstadoInicialUsuario(usuario = null) {
  if (!usuario) {
    return {
      nombre: "",
      email: "",
      rol: "empleado",
      password: "",
      confirmarPassword: "",
    };
  }

  return {
    nombre: usuario.nombre ?? "",

    email: usuario.email ?? "",

    rol: usuario.rol ?? "empleado",

    password: "",
    confirmarPassword: "",
  };
}

const baseSchema = {
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(150, "El nombre no puede superar los 150 caracteres."),

  email: z
    .string()
    .trim()
    .email("Ingresa un correo electrónico válido.")
    .max(200, "El correo es demasiado largo."),

  rol: z.enum(["empleado", "editor", "admin"]),
};

const createUserSchema = z
  .object({
    ...baseSchema,

    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .max(100, "La contraseña es demasiado larga."),

    confirmarPassword: z.string(),
  })
  .refine((datos) => datos.password === datos.confirmarPassword, {
    path: ["confirmarPassword"],

    message: "Las contraseñas no coinciden.",
  });

const updateUserSchema = z.object({
  ...baseSchema,

  password: z.string().optional(),

  confirmarPassword: z.string().optional(),
});

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .max(100, "La contraseña es demasiado larga."),

    confirmarPassword: z.string(),
  })
  .refine((datos) => datos.password === datos.confirmarPassword, {
    path: ["confirmarPassword"],

    message: "Las contraseñas no coinciden.",
  });

function convertirErrores(issues) {
  const errors = {};

  issues.forEach((issue) => {
    const campo = issue.path[0];

    if (campo && !errors[campo]) {
      errors[campo] = issue.message;
    }
  });

  return errors;
}

export function parseUserForm(values, { editando = false } = {}) {
  const schema = editando ? updateUserSchema : createUserSchema;

  const resultado = schema.safeParse(values);

  if (!resultado.success) {
    return {
      success: false,

      errors: convertirErrores(resultado.error.issues),

      data: null,
    };
  }

  const datos = resultado.data;

  const payload = {
    nombre: datos.nombre.trim(),

    email: datos.email.trim().toLowerCase(),

    rol: datos.rol,
  };

  if (!editando) {
    payload.password = datos.password;
  }

  return {
    success: true,
    errors: {},
    data: payload,
  };
}

export function parsePasswordForm(values) {
  const resultado = passwordSchema.safeParse(values);

  if (!resultado.success) {
    return {
      success: false,

      errors: convertirErrores(resultado.error.issues),

      data: null,
    };
  }

  return {
    success: true,
    errors: {},

    data: {
      password: resultado.data.password,
    },
  };
}
