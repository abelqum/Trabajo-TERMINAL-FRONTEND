"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { ArrowLeft, Building2, Eye, EyeOff, UserPlus } from "lucide-react";

import Swal from "sweetalert2";

import { ApiError } from "@/lib/api/apiClient";

import { authService } from "@/services/authService";

export default function RegisterPage() {
  const router = useRouter();

  const [empresa, setEmpresa] = useState("");

  const [nombre, setNombre] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [mostrarPassword, setMostrarPassword] = useState(false);

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const [cargando, setCargando] = useState(false);

  const [verificandoSesion, setVerificandoSesion] = useState(true);

  // =====================================================
  // EXISTING SESSION
  // =====================================================

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

        setVerificandoSesion(false);
      }
    }

    verificarSesion();

    return () => {
      controller.abort();
    };
  }, [router]);

  // =====================================================
  // REGISTER
  // =====================================================

  async function handleSubmit(event) {
    event.preventDefault();

    const empresaNormalizada = empresa.trim();

    const nombreNormalizado = nombre.trim();

    const correoNormalizado = email.trim().toLowerCase();

    if (
      !empresaNormalizada ||
      !nombreNormalizado ||
      !correoNormalizado ||
      !password ||
      !confirmarPassword
    ) {
      await Swal.fire({
        icon: "warning",

        title: "Datos incompletos",

        text: "Completa todos los campos para crear tu empresa.",

        confirmButtonText: "Aceptar",

        confirmButtonColor: "#1d4ed8",
      });

      return;
    }

    if (password.length < 8) {
      await Swal.fire({
        icon: "warning",

        title: "Contraseña demasiado corta",

        text: "La contraseña debe tener al menos 8 caracteres.",

        confirmButtonText: "Aceptar",

        confirmButtonColor: "#1d4ed8",
      });

      return;
    }

    if (password !== confirmarPassword) {
      await Swal.fire({
        icon: "warning",

        title: "Las contraseñas no coinciden",

        text: "Verifica la contraseña y su confirmación.",

        confirmButtonText: "Aceptar",

        confirmButtonColor: "#1d4ed8",
      });

      return;
    }

    setCargando(true);

    try {
      const usuario = await authService.registrarEmpresa({
        empresa: empresaNormalizada,

        nombre: nombreNormalizado,

        email: correoNormalizado,

        password,

        confirmarPassword,
      });

      await Swal.fire({
        icon: "success",

        title: "Empresa creada",

        text: usuario?.empresa?.nombre
          ? `Bienvenido a ${usuario.empresa.nombre}.`
          : "Tu empresa fue creada correctamente.",

        timer: 1400,

        showConfirmButton: false,
      });

      router.replace("/dashboard");

      router.refresh();
    } catch (error) {
      let mensaje = "No fue posible crear la empresa.";

      if (error instanceof ApiError && error.status === 409) {
        mensaje = error.message || "Ya existe una cuenta con ese correo.";
      } else if (error instanceof ApiError && error.status === 400) {
        mensaje = error.message || "Revisa los datos capturados.";
      } else if (error.message) {
        mensaje = error.message;
      }

      await Swal.fire({
        icon: "error",

        title: "No se pudo completar el registro",

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
      <section className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <header className="bg-brand-950 px-8 py-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <Building2 size={30} className="text-white" />
          </div>

          <h1 className="text-3xl font-black tracking-wide text-white">
            Crear empresa
          </h1>

          <p className="mt-2 text-sm font-medium text-brand-100">
            Comienza a utilizar el Sistema de Gestión para Microempresas
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 p-8">
          <div>
            <label
              htmlFor="empresa"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600"
            >
              Nombre de la empresa
            </label>

            <input
              id="empresa"
              type="text"
              autoComplete="organization"
              value={empresa}
              onChange={(event) => setEmpresa(event.target.value)}
              disabled={cargando}
              maxLength={200}
              placeholder="Ej. Óptica Estelar"
              required
              className="w-full rounded-lg border-2 border-slate-200 bg-slate-50 p-3 font-medium text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="nombre"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600"
            >
              Tu nombre
            </label>

            <input
              id="nombre"
              type="text"
              autoComplete="name"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              disabled={cargando}
              maxLength={150}
              placeholder="Administrador"
              required
              className="w-full rounded-lg border-2 border-slate-200 bg-slate-50 p-3 font-medium text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            />
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
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={cargando}
              maxLength={200}
              placeholder="admin@empresa.com"
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
                type={mostrarPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={cargando}
                minLength={8}
                maxLength={100}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border-2 border-slate-200 bg-slate-50 p-3 pr-12 font-medium text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() => setMostrarPassword((actual) => !actual)}
                disabled={cargando}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition-colors hover:text-brand-700 disabled:opacity-60"
              >
                {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <p className="mt-1 text-xs text-slate-400">Mínimo 8 caracteres.</p>
          </div>

          <div>
            <label
              htmlFor="confirmarPassword"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600"
            >
              Confirmar contraseña
            </label>

            <div className="relative">
              <input
                id="confirmarPassword"
                type={mostrarConfirmacion ? "text" : "password"}
                autoComplete="new-password"
                value={confirmarPassword}
                onChange={(event) => setConfirmarPassword(event.target.value)}
                disabled={cargando}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border-2 border-slate-200 bg-slate-50 p-3 pr-12 font-medium text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() => setMostrarConfirmacion((actual) => !actual)}
                disabled={cargando}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition-colors hover:text-brand-700 disabled:opacity-60"
              >
                {mostrarConfirmacion ? <EyeOff size={20} /> : <Eye size={20} />}
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
                Creando empresa...
              </>
            ) : (
              <>
                <UserPlus size={20} />
                Crear empresa
              </>
            )}
          </button>

          <div className="border-t border-slate-200 pt-5 text-center">
            <p className="text-sm text-slate-500">¿Ya tienes una cuenta?</p>

            <Link
              href="/"
              className="mt-2 inline-flex items-center gap-2 font-bold text-brand-700 transition-colors hover:text-brand-900"
            >
              <ArrowLeft size={17} />
              Iniciar sesión
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
