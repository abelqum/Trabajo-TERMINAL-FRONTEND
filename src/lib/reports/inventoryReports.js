import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

function moneda(valor) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(valor ?? 0));
}

async function imagenBase64(url) {
  if (!url) {
    return null;
  }

  try {
    const response = await fetch(url);

    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();

      reader.onloadend = () => resolve(reader.result);

      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export function generarReporteInventario(productos, valorInventario) {
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");

  doc.setFontSize(17);

  doc.text("Reporte de Inventario", 14, 18);

  doc.setFontSize(9);

  doc.setFont("helvetica", "normal");

  doc.text(`Generado: ${new Date().toLocaleString("es-MX")}`, 14, 25);

  doc.text(`Valor total: ${moneda(valorInventario)}`, 14, 31);

  autoTable(doc, {
    startY: 38,

    head: [["Producto", "Ubicación", "Stock", "Mínimo", "Precio", "Valor"]],

    body: productos.map((producto) => [
      `${producto.esKit ? "[KIT] " : ""}${producto.descripcion}${
        producto.modelo ? ` | ${producto.modelo}` : ""
      }`,

      `${producto.almacen?.nombre || "N/A"}${
        producto.fila ? ` / ${producto.fila}` : ""
      }`,

      producto.cantidad,

      producto.stockMinimo,

      moneda(producto.precioUnitario),

      moneda(producto.cantidad * producto.precioUnitario),
    ]),

    theme: "striped",

    headStyles: {
      fillColor: [30, 41, 59],
    },

    styles: {
      fontSize: 8,
    },
  });

  doc.save(`inventario_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export async function generarCatalogoInventario(productos) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const columnas = 4;
  const filas = 2;

  const itemsPorPagina = columnas * filas;

  const cardWidth = 65;
  const cardHeight = 85;

  for (let index = 0; index < productos.length; index += 1) {
    if (index > 0 && index % itemsPorPagina === 0) {
      doc.addPage();
    }

    const producto = productos[index];

    const posicion = index % itemsPorPagina;

    const columna = posicion % columnas;

    const fila = Math.floor(posicion / columnas);

    const x = 10 + columna * 69;

    const y = 15 + fila * 92;

    doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3);

    doc.setFont("helvetica", "bold");

    doc.setFontSize(9);

    doc.text(
      doc.splitTextToSize(
        `${producto.esKit ? "[KIT] " : ""}${producto.descripcion}`,
        cardWidth - 6,
      ),
      x + 3,
      y + 7,
    );

    doc.setFont("helvetica", "normal");

    doc.setFontSize(7);

    doc.text(`Modelo: ${producto.modelo || "N/A"}`, x + 3, y + 19);

    doc.text(`Stock: ${producto.cantidad}`, x + 3, y + 24);

    const foto = await imagenBase64(producto.fotoUrl);

    if (foto) {
      try {
        doc.addImage(foto, "WEBP", x + 5, y + 30, 32, 32);
      } catch {
        // Si el navegador entregó otro formato.
      }
    }

    const qr = await QRCode.toDataURL(producto.codigoQr, {
      width: 300,
      margin: 1,
    });

    doc.addImage(qr, "PNG", x + 40, y + 34, 20, 20);

    doc.setFontSize(6);

    doc.text(`ID: ${producto.id}`, x + 3, y + 80);
  }

  doc.save(`catalogo_inventario_${new Date().toISOString().slice(0, 10)}.pdf`);
}
