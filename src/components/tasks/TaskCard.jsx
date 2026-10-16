"use client";

import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock3,
  Eye,
  MessageSquareWarning,
  Play,
  Send,
  User,
  Users,
} from "lucide-react";

const ESTADOS = {
  PENDIENTE: {
    nombre: "Por hacer",
    icono: Circle,
    clase: "bg-slate-100 text-slate-700",
  },

  EN_PROGRESO: {
    nombre: "En progreso",
    icono: Clock3,
    clase: "bg-brand-100 text-brand-700",
  },

  REVISION: {
    nombre: "En revisión",
    icono: Eye,
    clase: "bg-purple-100 text-purple-700",
  },

  COMPLETADA: {
    nombre: "Completada",
    icono: CheckCircle2,
    clase: "bg-emerald-100 text-emerald-700",
  },
};

const PRIORIDADES = {
  URGENTE_IMPORTANTE: {
    nombre: "Urgente e importante",
    punto: "bg-red-500",
    etiqueta: "border-red-200 bg-red-50 text-red-700",
  },

  IMPORTANTE_NO_URGENTE: {
    nombre: "Importante no urgente",
    punto: "bg-orange-400",
    etiqueta: "border-orange-200 bg-orange-50 text-orange-700",
  },

  URGENTE_NO_IMPORTANTE: {
    nombre: "Urgente no importante",
    punto: "bg-brand-400",
    etiqueta: "border-brand-200 bg-brand-50 text-brand-700",
  },

  NO_URGENTE_NO_IMPORTANTE: {
    nombre: "No urgente no importante",
    punto: "bg-green-500",
    etiqueta: "border-green-200 bg-green-50 text-green-700",
  },
};

function formatearFecha(fecha) {
  if (!fecha) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(fecha));
}

export default function TaskCard({
  tarea,
  variante = "normal",
  procesando = false,
  onClick,
  onCambiarEstado,
}) {
  const estado = ESTADOS[tarea.estado] ?? ESTADOS.PENDIENTE;

  const prioridad =
    PRIORIDADES[tarea.prioridad] ?? PRIORIDADES.IMPORTANTE_NO_URGENTE;

  const EstadoIcono = estado.icono;

  const asignados = (tarea.asignados ?? [])
    .map((usuario) => usuario.nombre)
    .join(", ");

  const puedeIrA = (nuevoEstado) =>
    tarea.permisos?.estadosPermitidos?.includes(nuevoEstado) ?? false;

  const puedeIniciar = tarea.estado === "PENDIENTE" && puedeIrA("EN_PROGRESO");
  const puedeEnviarRevision =
    tarea.estado === "EN_PROGRESO" && puedeIrA("REVISION");
  const puedeRevisar = tarea.estado === "REVISION" && puedeIrA("COMPLETADA");

  function ejecutarAccion(event, nuevoEstado) {
    event.stopPropagation();

    if (!procesando) {
      onCambiarEstado?.(nuevoEstado);
    }
  }

  const compacta = variante === "matriz";

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (
          event.target === event.currentTarget &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          onClick?.();
        }
      }}
      className={`group cursor-pointer rounded-2xl border border-slate-200 bg-white transition-all hover:border-brand-300 hover:shadow-md ${
        compacta ? "p-3" : "p-5"
      } ${tarea.estado === "COMPLETADA" ? "opacity-80" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <span
              className={[
                "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
                prioridad.punto,
              ].join(" ")}
              title={prioridad.nombre}
            />
            <h3
              className={[
                "line-clamp-2 font-black leading-snug text-slate-800",
                compacta ? "text-xs" : "text-base",
                tarea.estado === "COMPLETADA"
                  ? "line-through text-slate-500"
                  : "",
              ].join(" ")}
            >
              {tarea.titulo}
            </h3>
          </div>
        </div>
        {!compacta && (
          <span
            className={[
              "flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-black",
              estado.clase,
            ].join(" ")}
          >
            <EstadoIcono size={12} />
            {estado.nombre}
          </span>
        )}
      </div>

      {!compacta && tarea.descripcion && (
        <p className="mt-3 line-clamp-2 text-sm font-medium leading-relaxed text-slate-500">
          {tarea.descripcion}
        </p>
      )}

      {!compacta && (
        <div
          className={`mt-4 inline-flex rounded-lg border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${prioridad.etiqueta}`}
        >
          {prioridad.nombre}
        </div>
      )}

      <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
        <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Calendar size={14} />

          {formatearFecha(tarea.fechaLimite)}
        </p>

        <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          {(tarea.asignados ?? []).length > 1 ? (
            <Users size={14} />
          ) : (
            <User size={14} />
          )}

          <span className="truncate">{asignados || "Sin asignación"}</span>
        </p>
      </div>

      {tarea.retroalimentacion && tarea.estado !== "COMPLETADA" && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-amber-800">
          <MessageSquareWarning size={15} className="mt-0.5 shrink-0" />

          <p className="line-clamp-2 text-[10px] font-bold">
            {tarea.retroalimentacion}
          </p>
        </div>
      )}

      {(puedeIniciar || puedeEnviarRevision || puedeRevisar) && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          {puedeIniciar && (
            <button
              type="button"
              disabled={procesando}
              onClick={(event) => ejecutarAccion(event, "EN_PROGRESO")}
              className="flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-brand-700 hover:bg-brand-100"
            >
              <Play size={13} />
              Iniciar
            </button>
          )}

          {puedeEnviarRevision && (
            <button
              type="button"
              disabled={procesando}
              onClick={(event) => ejecutarAccion(event, "REVISION")}
              className="flex items-center gap-1 rounded-lg bg-purple-50 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-purple-700 hover:bg-purple-100"
            >
              <Send size={13} />
              Enviar a revisión
            </button>
          )}

          {puedeRevisar && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onClick?.();
              }}
              className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-700 hover:bg-emerald-100"
            >
              <CheckCircle2 size={13} />
              Revisar tarea
            </button>
          )}
        </div>
      )}
    </article>
  );
}
