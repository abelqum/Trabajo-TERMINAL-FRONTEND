import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas-pro";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function formatearMoneda(valor) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(valor || 0));
}

function formatearPeriodo(valor) {
  if (!valor) {
    return "";
  }

  const [anio, mes] = valor.split("-");

  return `${MESES[Number(mes) - 1]} ${anio}`;
}

async function agregarCaptura(doc, elemento, titulo, posicionY) {
  if (!elemento) {
    return posicionY;
  }

  const canvas = await html2canvas(elemento, {
    scale: 1.5,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
  });

  const imagen = canvas.toDataURL("image/png", 0.95);

  const anchoPagina = doc.internal.pageSize.getWidth();

  const altoPagina = doc.internal.pageSize.getHeight();

  const anchoDisponible = anchoPagina - 24;

  const altoImagen = (canvas.height * anchoDisponible) / canvas.width;

  if (posicionY + altoImagen + 18 > altoPagina - 12) {
    doc.addPage();
    posicionY = 16;
  }

  doc.setFont("helvetica", "bold");

  doc.setFontSize(13);
  doc.setTextColor(30, 41, 59);

  doc.text(titulo, 12, posicionY);

  posicionY += 5;

  const altoMaximo = altoPagina - posicionY - 12;

  doc.addImage(
    imagen,
    "PNG",
    12,
    posicionY,
    anchoDisponible,
    Math.min(altoImagen, altoMaximo),
  );

  return posicionY + Math.min(altoImagen, altoMaximo) + 10;
}

export async function generarReporteDashboard({
  opciones,
  resumen,
  anioMensual,
  referencias,
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter",
  });

  const anchoPagina = doc.internal.pageSize.getWidth();

  doc.setFillColor(30, 41, 59);

  doc.rect(0, 0, anchoPagina, 32, "F");

  doc.setTextColor(255, 255, 255);

  doc.setFont("helvetica", "bold");

  doc.setFontSize(19);

  doc.text("Reporte financiero operativo", 12, 14);

  doc.setFont("helvetica", "normal");

  doc.setFontSize(9);

  doc.text("Sistema de Gestión para Microempresas", 12, 21);

  doc.text(
    new Intl.DateTimeFormat("es-MX", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date()),
    12,
    27,
  );

  let posicionY = 42;

  if (opciones.resumen) {
    doc.setFont("helvetica", "bold");

    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);

    doc.text("Resumen del periodo seleccionado", 12, posicionY);

    autoTable(doc, {
      startY: posicionY + 5,

      theme: "grid",

      headStyles: {
        fillColor: [29, 78, 216],
      },

      head: [["Indicador", "Resultado"]],

      body: [
        ["Ingresos", formatearMoneda(resumen?.ingresos)],
        ["Egresos registrados", formatearMoneda(resumen?.egresosRegistrados)],
        ["Viáticos", formatearMoneda(resumen?.viaticos)],
        ["Egresos totales", formatearMoneda(resumen?.egresosTotales)],
        [
          Number(resumen?.utilidad ?? 0) >= 0 ? "Utilidad" : "Déficit",

          formatearMoneda(resumen?.utilidad),
        ],
        ["Margen", `${Number(resumen?.margen ?? 0).toFixed(1)}%`],
        ["Pendiente por cobrar", formatearMoneda(resumen?.pendienteCobro)],
        [
          "Periodo",
          `${formatearPeriodo(resumen?.desde)} - ${formatearPeriodo(
            resumen?.hasta,
          )}`,
        ],
      ],
    });

    posicionY = doc.lastAutoTable.finalY + 10;
  }

  if (opciones.historica) {
    posicionY = await agregarCaptura(
      doc,
      referencias.historica,
      "Evolución histórica anual",
      posicionY,
    );
  }

  if (opciones.mensual) {
    posicionY = await agregarCaptura(
      doc,
      referencias.mensual,
      `Evolución mensual de ${anioMensual}`,
      posicionY,
    );
  }

  if (opciones.distribucion) {
    posicionY = await agregarCaptura(
      doc,
      referencias.distribucion,
      "Distribución financiera",
      posicionY,
    );
  }

  if (opciones.categorias) {
    await agregarCaptura(
      doc,
      referencias.categorias,
      "Egresos por categoría",
      posicionY,
    );
  }

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

  doc.save(`reporte_dashboard_${Date.now()}.pdf`);
}
