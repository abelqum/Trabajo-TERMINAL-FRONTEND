import { apiClient } from "@/lib/api/apiClient";

export const problemReportService = {
  report({ page, description, requestId = null }) {
    return apiClient("/reportar-problema", {
      method: "POST",

      body: {
        pagina: page,

        descripcion: description,

        requestId,
      },
    });
  },
};
