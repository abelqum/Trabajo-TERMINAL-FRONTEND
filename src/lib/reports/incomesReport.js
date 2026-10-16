import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function formatearMoneda(valor) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(valor ?? 0));
}

function formatearFecha(valor) {
  if (!valor) {
    return "—";
  }

  const fecha = new Date(`${valor}T12:00:00`);

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(fecha);
}

function obtenerFormaPago(valor) {
  const formas = {
    TRANSFERENCIA: "Transferencia",

    EFECTIVO: "Efectivo",

    TARJETA: "Tarjeta",

    CHEQUE: "Cheque",

    OTRO: "Otro",
  };

  return formas[valor] ?? "—";
}

export function generarReporteIngresos({
  registros,
  resumen,
  descripcionFiltros = [],
}) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "letter",
  });

  const anchoPagina = doc.internal.pageSize.getWidth();

  doc.setFillColor(23, 37, 84);

  doc.rect(0, 0, anchoPagina, 30, "F");

  doc.setTextColor(255, 255, 255);

  doc.setFont("helvetica", "bold");

  doc.setFontSize(18);

  doc.text("Reporte de Ingresos", 12, 13);

  doc.setFont("helvetica", "normal");

  doc.setFontSize(9);

  doc.text("Sistema de Gestión para Microempresas", 12, 20);

  doc.text(
    new Intl.DateTimeFormat("es-MX", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date()),
    12,
    26,
  );

  let posicionY = 38;

  doc.setTextColor(30, 41, 59);

  doc.setFont("helvetica", "bold");

  doc.setFontSize(12);

  doc.text("Resumen", 12, posicionY);

  autoTable(doc, {
    startY: posicionY + 4,

    theme: "grid",

    headStyles: {
      fillColor: [29, 78, 216],
    },

    head: [["Cobrado", "Pendiente", "Cancelado", "Registros"]],

    body: [
      [
        formatearMoneda(resumen.totalCobrado),

        formatearMoneda(resumen.totalPendiente),

        formatearMoneda(resumen.totalCancelado),

        String(resumen.cantidadRegistros ?? 0),
      ],
    ],
  });

  posicionY = doc.lastAutoTable.finalY + 8;

  if (descripcionFiltros.length > 0) {
    doc.setFont("helvetica", "bold");

    doc.setFontSize(10);

    doc.text("Filtros aplicados:", 12, posicionY);

    doc.setFont("helvetica", "normal");

    doc.setFontSize(9);

    descripcionFiltros.forEach((filtro) => {
      posicionY += 5;

      doc.text(`• ${filtro}`, 15, posicionY);
    });

    posicionY += 5;
  }

  autoTable(doc, {
    startY: posicionY,

    theme: "striped",

    styles: {
      fontSize: 7,
      cellPadding: 2,
    },

    headStyles: {
      fillColor: [30, 41, 59],
      fontSize: 7,
    },

    head: [
      [
        "Tipo",
        "Cliente",
        "Folio / Concepto",
        "Fecha",
        "Subtotal",
        "IVA",
        "Total",
        "Estado",
        "Fecha pago",
        "Forma pago",
      ],
    ],

    body: registros.map((ingreso) => [
      ingreso.tipoRegistro === "FACTURA" ? "Factura" : "Ingreso",

      ingreso.cliente.razonSocial,

      ingreso.folio || ingreso.concepto || "—",

      formatearFecha(ingreso.fecha),

      formatearMoneda(ingreso.subtotal),

      formatearMoneda(ingreso.iva),

      formatearMoneda(ingreso.total),

      ingreso.estado,

      formatearFecha(ingreso.fechaPago),

      obtenerFormaPago(ingreso.formaPago),
    ]),
  });

  const paginas = doc.internal.getNumberOfPages();

  for (let pagina = 1; pagina <= paginas; pagina += 1) {
    doc.setPage(pagina);

    doc.setFontSize(8);

    doc.setTextColor(100, 116, 139);

    doc.text(
      `Página ${pagina} de ${paginas}`,
      anchoPagina - 12,
      doc.internal.pageSize.getHeight() - 7,
      {
        align: "right",
      },
    );
  }

  const fechaArchivo = new Date().toISOString().slice(0, 10);

  doc.save(`reporte_ingresos_${fechaArchivo}.pdf`);
}
