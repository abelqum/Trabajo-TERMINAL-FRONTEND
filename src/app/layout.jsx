import "@/app/globals.css";

export const metadata = {
  title: {
    default: "Sistema de Gestión para Microempresas",
    template: "%s | Sistema de Gestión para Microempresas",
  },
  description:
    "Aplicación Web para la Gestión de Ingresos, Egresos, Inventario, Viáticos y Tareas para Micro Empresas.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
