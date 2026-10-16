"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn } from "lucide-react";

import Swal from "sweetalert2";

import { ApiError } from "@/lib/api/apiClient";
import { authService } from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [cargando, setCargando] = useState(false);

  const [verificandoSesion, setVerificandoSesion] = useState(true);

  const [mostrarPassword, setMostrarPassword] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function verificarSesion() {
      try {
        await authService.obtenerUsuarioActual({
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        router.replace("/dashboard");
      } catch (error) {
        if (error.name === "AbortError" || controller.signal.aborted) {
          return;
        }

        /*
         * 401 o 403 aquí son normales:
         * simplemente significa que el usuario
         * todavía no ha iniciado sesión.
         */
        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          setVerificandoSesion(false);
          return;
        }

        /*
         * Si Spring Boot está apagado, dejamos
         * visible el formulario. El error real se
         * mostrará si el usuario intenta iniciar sesión.
         */
        setVerificandoSesion(false);
      }
    }

    verificarSesion();

    return () => {
      controller.abort();
    };
  }, [router]);

  async function handleLogin(event) {
    event.preventDefault();

    const correoNormalizado = email.trim().toLowerCase();

    if (!correoNormalizado || !password) {
      await Swal.fire({
        icon: "warning",
        title: "Datos incompletos",
        text: "Ingresa tu correo electrónico y contraseña.",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#1d4ed8",
      });

      return;
    }

    setCargando(true);

    try {
      await authService.iniciarSesion(correoNormalizado, password);

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      let mensaje = "No fue posible iniciar sesión.";

      if (error instanceof ApiError && error.status === 401) {
        mensaje = "El correo o la contraseña son incorrectos.";
      } else if (error.message) {
        mensaje = error.message;
      }

      await Swal.fire({
        icon: "error",
        title: "No se pudo iniciar sesión",
        text: mensaje,
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setCargando(false);
    }
  }

  if (verificandoSesion) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand-700" />

          <p className="text-sm font-medium text-slate-500">
            Verificando sesión...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <header className="bg-brand-950 px-8 py-9 text-center">
          <h1 className="text-3xl font-black tracking-wide text-white">
            Sistema de Gestión
          </h1>

          <p className="mt-2 text-sm font-medium text-brand-100">
            Administración para microempresas
          </p>
        </header>

        <form onSubmit={handleLogin} className="space-y-6 p-8">
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900">Iniciar sesión</h2>

            <p className="mt-1 text-sm text-slate-500">
              Ingresa tus credenciales para acceder al sistema.
            </p>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600"
            >
              Correo electrónico
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="usuario@correo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={cargando}
              required
              className="w-full rounded-lg border-2 border-slate-200 bg-slate-50 p-3 font-medium text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600"
            >
              Contraseña
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={mostrarPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={cargando}
                required
                className="w-full rounded-lg border-2 border-slate-200 bg-slate-50 p-3 pr-12 font-medium text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() => setMostrarPassword((actual) => !actual)}
                disabled={cargando}
                aria-label={
                  mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition-colors hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-800 via-brand-700 to-brand-600 p-3 text-base font-bold text-white shadow-lg transition-all hover:from-brand-900 hover:via-brand-800 hover:to-brand-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cargando ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Iniciando sesión...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Ingresar
              </>
            )}
          </button>
          <div className="border-t border-slate-200 pt-5 text-center">
            <p className="text-sm text-slate-500">
              ¿Aún no tienes una empresa registrada?
            </p>

            <Link
              href="/registro"
              className="mt-2 inline-flex font-bold text-brand-700 transition-colors hover:text-brand-900"
            >
              Crear una empresa
            </Link>
          </div>
        </form>

        <footer className="border-t border-slate-200 bg-slate-50 px-8 py-4 text-center">
          <p className="text-xs leading-relaxed text-slate-500">
            Aplicación Web para la Gestión de Ingresos, Egresos, Inventario,
            Viáticos y Tareas para Micro Empresas
          </p>
        </footer>
      </section>
    </main>
  );
}
