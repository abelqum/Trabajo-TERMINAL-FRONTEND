"use client";

import { useEffect, useId, useRef } from "react";

import { ScanLine, X } from "lucide-react";

import { Html5Qrcode } from "html5-qrcode";

export default function InventoryQrScanner({ onScan, onClose }) {
  const reactId = useId();

  const elementId = `inventory-qr-${reactId.replace(/:/g, "")}`;

  const scannerRef = useRef(null);

  const procesadoRef = useRef(false);

  useEffect(() => {
    let cancelado = false;

    const scanner = new Html5Qrcode(elementId);

    scannerRef.current = scanner;

    async function iniciar() {
      try {
        await scanner.start(
          {
            facingMode: "environment",
          },
          {
            fps: 10,

            qrbox: {
              width: 240,
              height: 240,
            },
          },
          async (decodedText) => {
            if (cancelado || procesadoRef.current) {
              return;
            }

            procesadoRef.current = true;

            try {
              await scanner.stop();
            } catch {
              // Ya pudo haberse detenido.
            }

            onScan(decodedText);
          },
          () => {},
        );
      } catch (error) {
        console.error("Error iniciando lector QR:", error);
      }
    }

    iniciar();

    return () => {
      cancelado = true;

      const scannerActual = scannerRef.current;

      scannerRef.current = null;

      if (!scannerActual) {
        return;
      }

      scannerActual
        .stop()
        .catch(() => {})
        .finally(() => {
          scannerActual.clear().catch(() => {});
        });
    };
  }, [elementId, onScan]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-black text-slate-800">
              <ScanLine className="text-brand-700" />
              Escáner de inventario
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Apunta la cámara al QR del producto.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div
          id={elementId}
          className="min-h-[320px] overflow-hidden rounded-2xl bg-black"
        />
      </div>
    </div>
  );
}
