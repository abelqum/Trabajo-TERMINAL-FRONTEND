import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import {
  obtenerNombreCategoriaViatico,
  VIATIC_CATEGORIES,
} from "@/validations/viaticSchema";

function moneda(valor) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(valor ?? 0));
}

function fecha(valor) {
  if (!valor) {
    return "—";
  }

  return new Intl.DateTimeFormat("es-MX").format(new Date(`${valor}T12:00:00`));
}

export function generarLiquidacionViatico(viaje) {
  const doc = new jsPDF({
    unit: "mm",
    format: "letter",
  });

  const ancho = doc.internal.pageSize.getWidth();

  doc.setFillColor(23, 37, 84);

  doc.rect(0, 0, ancho, 30, "F");

  doc.setTextColor(255, 255, 255);

  doc.setFont("helvetica", "bold");

  doc.setFontSize(17);

  doc.text("Liquidación de Viáticos", 14, 13);

  doc.setFontSize(9);

  doc.setFont("helvetica", "normal");

  doc.text("Sistema de Gestión para Microempresas", 14, 20);

  doc.setTextColor(30, 41, 59);

  doc.setFontSize(11);

  doc.setFont("helvetica", "bold");

  doc.text(`${viaje.nombre} — ${viaje.destino}`, 14, 40);

  doc.setFont("helvetica", "normal");

  doc.setFontSize(9);

  doc.text(
    `Periodo: ${fecha(viaje.fechaInicio)} al ${fecha(
      viaje.fechaFin,
    )} (${viaje.dias} días)`,
    14,
    47,
  );

  doc.text(
    `Personal: ${
      viaje.usuarios.map((usuario) => usuario.nombre).join(", ") ||
      "Sin personal"
    }`,
    14,
    53,
  );

  autoTable(doc, {
    startY: 60,

    theme: "grid",

    headStyles: {
      fillColor: [29, 78, 216],
    },

    head: [["Fondo autorizado", "Gastos aprobados", "Saldo final"]],

    body: [
      [
        moneda(viaje.presupuesto.total),

        moneda(viaje.resumen.gastadoAprobado),

        moneda(viaje.resumen.saldo),
      ],
    ],
  });

  let posicionY = doc.lastAutoTable.finalY + 10;

  const aprobados = viaje.gastos.filter(
    (gasto) => gasto.estatus === "APROBADO",
  );

  VIATIC_CATEGORIES.forEach((categoria) => {
    const clave = categoria.value.toLowerCase();

    const presupuesto = Number(viaje.presupuesto[clave] ?? 0);

    const gastos = aprobados.filter(
      (gasto) => gasto.categoria === categoria.value,
    );

    const gastado = gastos.reduce(
      (total, gasto) => total + Number(gasto.monto),
      0,
    );

    if (presupuesto === 0 && gastos.length === 0) {
      return;
    }

    if (posicionY > 230) {
      doc.addPage();
      posicionY = 18;
    }

    const saldo = presupuesto - gastado;

    doc.setFont("helvetica", "bold");

    doc.setFontSize(11);

    doc.text(obtenerNombreCategoriaViatico(categoria.value), 14, posicionY);

    const filas = gastos.map((gasto) => [
      fecha(gasto.fecha),
      gasto.descripcion,
      moneda(gasto.monto),
    ]);

    filas.push([
      "",
      `Presupuesto: ${moneda(presupuesto)} | Gastado: ${moneda(gastado)}`,
      `${saldo >= 0 ? "Sobrante" : "Excedente"}: ${moneda(Math.abs(saldo))}`,
    ]);

    autoTable(doc, {
      startY: posicionY + 4,

      theme: "grid",

      styles: {
        fontSize: 8,
      },

      headStyles: {
        fillColor: [30, 41, 59],
      },

      head: [["Fecha", "Descripción", "Monto"]],

      body: filas,

      columnStyles: {
        2: {
          halign: "right",
        },
      },
    });

    posicionY = doc.lastAutoTable.finalY + 10;
  });

  const paginas = doc.internal.getNumberOfPages();

  for (let pagina = 1; pagina <= paginas; pagina += 1) {
    doc.setPage(pagina);

    doc.setFontSize(8);

    doc.setTextColor(100, 116, 139);

    doc.text(
      `Página ${pagina} de ${paginas}`,
      ancho - 12,
      doc.internal.pageSize.getHeight() - 7,
      {
        align: "right",
      },
    );
  }

  doc.save(`liquidacion_viaticos_${viaje.id}.pdf`);
}
