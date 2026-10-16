const COLOR_PRINCIPAL = "#1D4ED8";

const COLOR_SIDEBAR = "#172554";

function normalizarHex(color, fallback) {
  if (typeof color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(color)) {
    return fallback;
  }

  return color.toUpperCase();
}

function hexARgb(hex) {
  const limpio = hex.replace("#", "");

  return {
    r: parseInt(limpio.slice(0, 2), 16),

    g: parseInt(limpio.slice(2, 4), 16),

    b: parseInt(limpio.slice(4, 6), 16),
  };
}

function rgbAHex({ r, g, b }) {
  return `#${[r, g, b]
    .map((valor) => Math.round(valor).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

function mezclar(colorA, colorB, porcentaje) {
  const a = hexARgb(colorA);

  const b = hexARgb(colorB);

  return rgbAHex({
    r: a.r + (b.r - a.r) * porcentaje,

    g: a.g + (b.g - a.g) * porcentaje,

    b: a.b + (b.b - a.b) * porcentaje,
  });
}

export function crearEstilosMarca(empresa) {
  const principal = normalizarHex(empresa?.colorPrincipal, COLOR_PRINCIPAL);

  const sidebar = normalizarHex(empresa?.colorSidebar, COLOR_SIDEBAR);

  return {
    /*
     * Main corporate palette.
     */
    "--brand-50": mezclar(principal, "#FFFFFF", 0.94),

    "--brand-100": mezclar(principal, "#FFFFFF", 0.86),

    "--brand-200": mezclar(principal, "#FFFFFF", 0.72),

    "--brand-300": mezclar(principal, "#FFFFFF", 0.55),

    "--brand-400": mezclar(principal, "#FFFFFF", 0.38),

    "--brand-500": mezclar(principal, "#FFFFFF", 0.22),

    "--brand-600": mezclar(principal, "#FFFFFF", 0.1),

    "--brand-700": principal,

    "--brand-800": mezclar(principal, "#000000", 0.16),

    "--brand-900": mezclar(principal, "#000000", 0.3),

    "--brand-950": mezclar(principal, "#000000", 0.42),

    /*
     * Sidebar palette.
     */
    "--brand-sidebar": sidebar,

    "--brand-sidebar-hover": mezclar(sidebar, "#FFFFFF", 0.1),

    "--brand-sidebar-border": mezclar(sidebar, "#FFFFFF", 0.16),

    "--brand-sidebar-muted": mezclar(sidebar, "#FFFFFF", 0.65),
  };
}
