import { z } from "zod";

function numeroNoNegativo(mensaje) {
  return z.string().refine((valor) => {
    const numero = Number(valor);

    return Number.isFinite(numero) && numero >= 0;
  }, mensaje);
}

export function crearEstadoInicialProducto(producto = null) {
  if (!producto) {
    return {
      descripcion: "",
      modelo: "",
      categoriaId: "",
      marcaId: "",
      unidadMedidaId: "",
      proveedorId: "",
      medidaId: "",
      almacenId: "",
      condicionId: "",
      fila: "",
      precioUnitario: "0",
      stockMinimo: "1",
      cantidadInicial: "0",
      aplicaMedida: false,
    };
  }

  return {
    descripcion: producto.descripcion ?? "",

    modelo: producto.modelo ?? "",

    categoriaId: String(producto.categoria?.id ?? ""),

    marcaId: String(producto.marca?.id ?? ""),

    unidadMedidaId: String(producto.unidadMedida?.id ?? ""),

    proveedorId: String(producto.proveedor?.id ?? ""),

    medidaId: String(producto.medida?.id ?? ""),

    almacenId: String(producto.almacen?.id ?? ""),

    condicionId: String(producto.condicion?.id ?? ""),

    fila: producto.fila ?? "",

    precioUnitario: String(producto.precioUnitario ?? 0),

    stockMinimo: String(producto.stockMinimo ?? 1),

    /*
     * En edición no modificaremos
     * existencia desde este formulario.
     */
    cantidadInicial: "0",

    aplicaMedida: Boolean(producto.medida?.id),
  };
}

const productSchema = z.object({
  descripcion: z
    .string()
    .trim()
    .min(1, "La descripción es obligatoria.")
    .max(200, "La descripción no puede superar 200 caracteres."),

  modelo: z
    .string()
    .trim()
    .max(100, "El modelo no puede superar 100 caracteres."),

  categoriaId: z.string(),

  marcaId: z.string(),

  unidadMedidaId: z.string(),

  proveedorId: z.string(),

  medidaId: z.string(),

  almacenId: z.string(),

  condicionId: z.string(),

  fila: z.string().trim().max(50, "La ubicación/fila es demasiado larga."),

  precioUnitario: numeroNoNegativo("El precio unitario no puede ser negativo."),

  stockMinimo: numeroNoNegativo("El stock mínimo no puede ser negativo."),

  cantidadInicial: numeroNoNegativo(
    "La cantidad inicial no puede ser negativa.",
  ),

  aplicaMedida: z.boolean(),
});

function idONull(valor) {
  return valor ? Number(valor) : null;
}

export function parseProductForm(values, { editando = false } = {}) {
  const resultado = productSchema.safeParse(values);

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

  const payload = {
    descripcion: datos.descripcion.trim(),

    modelo: datos.modelo.trim() || null,

    categoriaId: idONull(datos.categoriaId),

    marcaId: idONull(datos.marcaId),

    unidadMedidaId: idONull(datos.unidadMedidaId),

    proveedorId: idONull(datos.proveedorId),

    medidaId: datos.aplicaMedida ? idONull(datos.medidaId) : null,

    almacenId: idONull(datos.almacenId),

    condicionId: idONull(datos.condicionId),

    fila: datos.fila.trim() || null,

    precioUnitario: Number(datos.precioUnitario),

    stockMinimo: Number(datos.stockMinimo),
  };

  if (!editando) {
    payload.cantidadInicial = Number(datos.cantidadInicial);
  }

  return {
    success: true,
    errors: {},
    data: payload,
  };
}
