import imageCompression from "browser-image-compression";

async function optimizarImagen(
  archivo,
  { maxSizeMB, maxWidthOrHeight, initialQuality, nombre },
) {
  if (!archivo) {
    return null;
  }

  if (!archivo.type?.startsWith("image/")) {
    throw new Error("El archivo seleccionado debe ser una imagen.");
  }

  const comprimida = await imageCompression(archivo, {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality,
  });

  return new File([comprimida], `${nombre}_${Date.now()}.webp`, {
    type: "image/webp",
  });
}

export function optimizarLogoEmpresa(archivo) {
  return optimizarImagen(archivo, {
    maxSizeMB: 0.15,
    maxWidthOrHeight: 512,
    initialQuality: 0.8,
    nombre: "logo",
  });
}

export function optimizarFotoProducto(archivo) {
  return optimizarImagen(archivo, {
    maxSizeMB: 0.45,
    maxWidthOrHeight: 1200,
    initialQuality: 0.78,
    nombre: "producto",
  });
}

export function optimizarEvidencia(archivo, indice = 0) {
  return optimizarImagen(archivo, {
    maxSizeMB: 0.6,
    maxWidthOrHeight: 1600,
    initialQuality: 0.76,
    nombre: `evidencia_${indice}`,
  });
}

export function optimizarComprobante(archivo, indice = 0) {
  return optimizarImagen(archivo, {
    maxSizeMB: 0.6,
    maxWidthOrHeight: 1600,
    initialQuality: 0.78,
    nombre: `comprobante_${indice}`,
  });
}
