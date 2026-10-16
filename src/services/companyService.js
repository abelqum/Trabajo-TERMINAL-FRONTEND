import { apiClient, resolverApiUrl } from "@/lib/api/apiClient";

import { optimizarLogoEmpresa } from "@/lib/images/imageOptimizer";

function normalizarEmpresa(empresa) {
  return {
    id: empresa?.id ?? null,

    nombre: empresa?.nombre ?? "",

    logoUrl: resolverApiUrl(empresa?.logoUrl),

    colorPrincipal: empresa?.colorPrincipal || "#1D4ED8",

    colorSidebar: empresa?.colorSidebar || "#172554",
  };
}

export const companyService = {
  async obtenerEmpresa({ signal } = {}) {
    const response = await apiClient("/configuracion/empresa", {
      method: "GET",
      signal,
    });

    return normalizarEmpresa(response);
  },

  async actualizarEmpresa(datos, logo = null) {
    const formData = new FormData();

    formData.append(
      "datos",

      new Blob([JSON.stringify(datos)], {
        type: "application/json",
      }),
    );

    if (logo) {
      const optimizado = await optimizarLogoEmpresa(logo);

      formData.append("logo", optimizado);
    }

    const response = await apiClient("/configuracion/empresa", {
      method: "PUT",

      body: formData,
    });

    return normalizarEmpresa(response);
  },

  async eliminarLogo() {
    const response = await apiClient("/configuracion/empresa/logo", {
      method: "DELETE",
    });

    return normalizarEmpresa(response);
  },
};
