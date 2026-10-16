import imageCompression from "browser-image-compression";

import { apiClient } from "@/lib/api/apiClient";

function obtenerContenido(response) {
  return response?.data ?? response;
}

function normalizarCatalogoItem(item) {
  return {
    id: item?.id ?? null,

    nombre: item?.nombre ?? "",

    enlace: item?.enlace ?? null,

    permiteActualizarPrecio: Boolean(item?.permiteActualizarPrecio),
  };
}

function normalizarProducto(producto) {
  return {
    id: producto?.id ?? null,

    descripcion: producto?.descripcion ?? "",

    modelo: producto?.modelo ?? null,

    cantidad: Number(producto?.cantidad ?? 0),

    marca: producto?.marca ?? null,

    medida: producto?.medida ?? null,

    condicion: producto?.condicion ?? null,

    proveedor: producto?.proveedor ?? null,
  };
}

function normalizarKit(kit) {
  return {
    id: kit?.id ?? null,

    descripcion: kit?.descripcion ?? "",

    cantidad: Number(kit?.cantidad ?? 0),

    precioUnitario: Number(kit?.precioUnitario ?? 0),

    fila: kit?.fila ?? null,

    fotoUrl: kit?.fotoUrl ?? null,

    categoria: kit?.categoria ?? null,

    almacen: kit?.almacen ?? null,

    componentes: Array.isArray(kit?.componentes)
      ? kit.componentes.map((componente) => ({
          productoId: componente.productoId ?? componente.producto?.id,

          producto: componente.producto
            ? normalizarProducto(componente.producto)
            : null,

          cantidadNecesaria: Number(componente.cantidadNecesaria ?? 0),
        }))
      : [],
  };
}

async function optimizarFoto(archivo) {
  if (!archivo) {
    return null;
  }

  if (!archivo.type.startsWith("image/")) {
    throw new Error("La fotografía debe ser una imagen.");
  }

  const comprimida = await imageCompression(archivo, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.8,
  });

  return new File([comprimida], `kit_${Date.now()}.webp`, {
    type: comprimida.type || "image/webp",
  });
}

async function crearFormDataKit(datos, foto) {
  const formData = new FormData();

  formData.append(
    "datos",
    new Blob([JSON.stringify(datos)], {
      type: "application/json",
    }),
  );

  if (foto) {
    const optimizada = await optimizarFoto(foto);

    formData.append("foto", optimizada);
  }

  return formData;
}

export const configurationService = {
  async obtenerConfiguracion({ signal } = {}) {
    const response = await apiClient("/configuracion", {
      method: "GET",
      signal,
    });

    const data = obtenerContenido(response) ?? {};

    return {
      perfil: {
        id: data.perfil?.id ?? null,

        nombre: data.perfil?.nombre ?? "",

        email: data.perfil?.email ?? "",

        rol: String(data.perfil?.rol ?? "").toLowerCase(),
      },

      permisos: {
        administrarCatalogos: Boolean(data.permisos?.administrarCatalogos),

        administrarKits: Boolean(data.permisos?.administrarKits),

        descargarRespaldo: Boolean(data.permisos?.descargarRespaldo),
      },
    };
  },

  async actualizarPerfil(datos) {
    const response = await apiClient("/configuracion/perfil", {
      method: "PUT",
      body: datos,
    });

    return obtenerContenido(response);
  },

  cambiarPassword(datos) {
    return apiClient("/configuracion/password", {
      method: "PATCH",
      body: datos,
    });
  },

  async obtenerCatalogo(tipo, { signal } = {}) {
    const response = await apiClient(`/configuracion/catalogos/${tipo}`, {
      method: "GET",
      signal,
    });

    const items = obtenerContenido(response);

    return Array.isArray(items) ? items.map(normalizarCatalogoItem) : [];
  },

  async crearCatalogoItem(tipo, datos) {
    const response = await apiClient(`/configuracion/catalogos/${tipo}`, {
      method: "POST",
      body: datos,
    });

    return normalizarCatalogoItem(obtenerContenido(response));
  },

  async actualizarCatalogoItem(tipo, id, datos) {
    const response = await apiClient(`/configuracion/catalogos/${tipo}/${id}`, {
      method: "PUT",
      body: datos,
    });

    return normalizarCatalogoItem(obtenerContenido(response));
  },

  eliminarCatalogoItem(tipo, id) {
    return apiClient(`/configuracion/catalogos/${tipo}/${id}`, {
      method: "DELETE",
    });
  },

  async obtenerKits({ signal } = {}) {
    const response = await apiClient("/configuracion/kits", {
      method: "GET",
      signal,
    });

    const kits = obtenerContenido(response);

    return Array.isArray(kits) ? kits.map(normalizarKit) : [];
  },

  async obtenerProductosParaKits({ signal } = {}) {
    const response = await apiClient(
      "/configuracion/kits/productos-disponibles",
      {
        method: "GET",
        signal,
      },
    );

    const productos = obtenerContenido(response);

    return Array.isArray(productos) ? productos.map(normalizarProducto) : [];
  },

  async crearKit(datos, foto = null) {
    const body = await crearFormDataKit(datos, foto);

    const response = await apiClient("/configuracion/kits", {
      method: "POST",
      body,
    });

    return normalizarKit(obtenerContenido(response));
  },

  async actualizarKit(id, datos, foto = null) {
    const body = await crearFormDataKit(datos, foto);

    const response = await apiClient(`/configuracion/kits/${id}`, {
      method: "PUT",
      body,
    });

    return normalizarKit(obtenerContenido(response));
  },

  eliminarKit(id) {
    return apiClient(`/configuracion/kits/${id}`, {
      method: "DELETE",
    });
  },

  async descargarRespaldo() {
    const response = await apiClient("/configuracion/respaldo", {
      method: "GET",
    });

    const contenido = obtenerContenido(response) ?? response;

    const blob = new Blob([JSON.stringify(contenido, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const enlace = document.createElement("a");

    enlace.href = url;

    enlace.download = `respaldo_sistema_${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    document.body.appendChild(enlace);

    enlace.click();

    enlace.remove();

    URL.revokeObjectURL(url);
  },
};
