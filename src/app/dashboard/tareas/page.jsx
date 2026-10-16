"use client";

import { useEffect, useState } from "react";

import {
  CheckCircle2,
  Filter,
  LayoutGrid,
  List,
  ListTodo,
  Plus,
} from "lucide-react";

import Swal from "sweetalert2";

import TaskDateView from "@/components/tasks/TaskDateView";
import TaskDetailModal from "@/components/tasks/TaskDetailModal";
import TaskFormModal from "@/components/tasks/TaskFormModal";
import TaskMatrix from "@/components/tasks/TaskMatrix";

import { ApiError } from "@/lib/api/apiClient";

import { authService } from "@/services/authService";

import { tasksService } from "@/services/tasksService";

export default function TareasPage() {
  const [tareas, setTareas] = useState([]);

  const [usuarios, setUsuarios] = useState([]);

  const [usuarioActual, setUsuarioActual] = useState(null);

  const [permisos, setPermisos] = useState({
    crearTarea: false,
  });

  const [vista, setVista] = useState("FECHAS");

  const [filtroUsuario, setFiltroUsuario] = useState("TODAS");

  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  const [cargando, setCargando] = useState(true);

  const [procesandoId, setProcesandoId] = useState(null);

  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);

  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);

  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function cargarContexto() {
      try {
        const [usuario, opciones] = await Promise.all([
          authService.obtenerUsuarioActual({
            signal: controller.signal,
          }),

          tasksService.obtenerUsuariosAsignables({
            signal: controller.signal,
          }),
        ]);

        if (controller.signal.aborted) {
          return;
        }

        setUsuarioActual(usuario);

        setUsuarios(opciones);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);
        }
      }
    }

    cargarContexto();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function cargarTareas() {
      try {
        const response = await tasksService.obtenerTareas({
          filtroUsuario,
          estado: filtroEstado,

          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setTareas(response.tareas);

        setPermisos(response.permisos);

        setCargando(false);
      } catch (error) {
        if (error.name === "AbortError" || controller.signal.aborted) {
          return;
        }

        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          return;
        }

        console.error(error);

        setCargando(false);

        await Swal.fire({
          icon: "error",
          title: "No se pudieron cargar las tareas",
          text: error.message || "No fue posible consultar las actividades.",
        });
      }
    }

    cargarTareas();

    return () => {
      controller.abort();
    };
  }, [filtroUsuario, filtroEstado, recarga]);

  function sustituirTarea(actualizada) {
    setTareas((actuales) =>
      actuales.map((tarea) =>
        tarea.id === actualizada.id ? actualizada : tarea,
      ),
    );

    setTareaSeleccionada((actual) =>
      actual?.id === actualizada.id ? actualizada : actual,
    );
  }

  async function abrirDetalle(tarea) {
    try {
      const detalle = await tasksService.obtenerTarea(tarea.id);

      setTareaSeleccionada(detalle);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo abrir la tarea",
        text: error.message,
      });
    }
  }

  async function cambiarEstado(tarea, nuevoEstado) {
    setProcesandoId(tarea.id);

    try {
      const actualizada = await tasksService.cambiarEstado(
        tarea.id,
        nuevoEstado,
      );

      sustituirTarea(actualizada);

      if (nuevoEstado === "REVISION") {
        await Swal.fire({
          icon: "success",
          title: "Enviada a revisión",
          timer: 1300,
          showConfirmButton: false,
        });
      }

      if (nuevoEstado === "COMPLETADA") {
        await Swal.fire({
          icon: "success",
          title: "Tarea completada",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo cambiar el estado",
        text: error.message,
      });

      setRecarga((actual) => actual + 1);
    } finally {
      setProcesandoId(null);
    }
  }

  async function moverTarea(tarea, destino) {
    const cambiaPrioridad = tarea.prioridad !== destino.prioridad;

    const cambiaEstado = tarea.estado !== destino.estado;

    if (cambiaPrioridad && !tarea.permisos.cambiarPrioridad) {
      await Swal.fire({
        icon: "warning",
        title: "No puedes cambiar la prioridad",
        text: "No tienes permiso para modificar la prioridad de esta tarea.",
      });

      return;
    }

    if (
      cambiaEstado &&
      !tarea.permisos.estadosPermitidos.includes(destino.estado)
    ) {
      await Swal.fire({
        icon: "warning",
        title: "Cambio no permitido",
        text: "No tienes permiso para mover la tarea a ese estado.",
      });

      return;
    }

    const confirmacion = await Swal.fire({
      icon: "question",
      title: "¿Mover tarea?",
      text: "Se actualizará su prioridad y/o estado.",
      showCancelButton: true,
      confirmButtonText: "Mover",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#1d4ed8",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    setProcesandoId(tarea.id);

    try {
      const actualizada = await tasksService.moverTarea(tarea.id, destino);

      sustituirTarea(actualizada);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo mover la tarea",
        text: error.message,
      });

      setRecarga((actual) => actual + 1);
    } finally {
      setProcesandoId(null);
    }
  }

  async function actualizarTarea(datos) {
    if (!tareaSeleccionada) {
      return;
    }

    setProcesandoId(tareaSeleccionada.id);

    try {
      const actualizada = await tasksService.actualizarTarea(
        tareaSeleccionada.id,
        datos,
      );

      sustituirTarea(actualizada);

      await Swal.fire({
        icon: "success",
        title: "Tarea actualizada",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo actualizar",
        text: error.message,
      });
    } finally {
      setProcesandoId(null);
    }
  }

  async function retroalimentar(comentario) {
    if (!tareaSeleccionada) {
      return;
    }

    setProcesandoId(tareaSeleccionada.id);

    try {
      const actualizada = await tasksService.retroalimentar(
        tareaSeleccionada.id,
        comentario,
      );

      sustituirTarea(actualizada);

      await Swal.fire({
        icon: "success",
        title: "Retroalimentación enviada",
        text: "La tarea regresó a Por hacer.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo enviar",
        text: error.message,
      });
    } finally {
      setProcesandoId(null);
    }
  }

  async function eliminarTarea() {
    if (!tareaSeleccionada) {
      return;
    }

    const confirmacion = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar tarea?",
      text: "La tarea y sus evidencias dejarán de estar disponibles.",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    setProcesandoId(tareaSeleccionada.id);

    try {
      await tasksService.eliminarTarea(tareaSeleccionada.id);

      const id = tareaSeleccionada.id;

      setTareas((actuales) => actuales.filter((tarea) => tarea.id !== id));

      setTareaSeleccionada(null);

      await Swal.fire({
        icon: "success",
        title: "Tarea eliminada",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo eliminar",
        text: error.message,
      });
    } finally {
      setProcesandoId(null);
    }
  }

  function tareaCreada() {
    setModalCrearAbierto(false);

    setCargando(true);

    setRecarga((actual) => actual + 1);
  }

  const selectClass =
    "rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10";

  return (
    <>
      <div className="mx-auto max-w-[95rem] space-y-6 pb-12">
        <header className="space-y-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black text-slate-800">
              <ListTodo className="text-brand-700" />
              Control de Tareas
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Gestiona actividades, responsables, prioridades, evidencias y
              flujo de revisión.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative w-full sm:w-auto">
              <Filter
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={filtroUsuario}
                onChange={(event) => {
                  setCargando(true);

                  setFiltroUsuario(event.target.value);
                }}
                className={`${selectClass} w-full pl-9 sm:w-64`}
              >
                <option value="TODAS">Todas las tareas</option>

                <option value="MIS_TAREAS">Lo que me toca hacer</option>

                <option value="ASIGNADAS_POR_MI">Lo que delegué</option>

                {usuarioActual &&
                  ["admin", "editor"].includes(usuarioActual.rol) && (
                    <optgroup label="Equipo">
                      {usuarios
                        .filter((usuario) => usuario.id !== usuarioActual.id)
                        .map((usuario) => (
                          <option
                            key={usuario.id}
                            value={`USUARIO:${usuario.id}`}
                          >
                            Tareas de {usuario.nombre}
                          </option>
                        ))}
                    </optgroup>
                  )}
              </select>
            </div>

            <select
              value={filtroEstado}
              onChange={(event) => {
                setCargando(true);

                setFiltroEstado(event.target.value);
              }}
              className={`${selectClass} w-full sm:w-auto`}
            >
              <option value="TODOS">Todos los estados</option>

              <option value="PENDIENTE">Por hacer</option>

              <option value="EN_PROGRESO">En progreso</option>

              <option value="REVISION">En revisión</option>

              <option value="COMPLETADA">Completadas</option>
            </select>

            <div className="flex w-full rounded-xl border border-slate-300 bg-white p-1 sm:w-auto">
              <button
                type="button"
                onClick={() => setVista("FECHAS")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-wider sm:flex-none ${
                  vista === "FECHAS"
                    ? "bg-brand-700 text-white"
                    : "text-slate-500"
                }`}
              >
                <List size={15} />
                Fechas
              </button>

              <button
                type="button"
                onClick={() => setVista("MATRIZ")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-wider sm:flex-none ${
                  vista === "MATRIZ"
                    ? "bg-brand-700 text-white"
                    : "text-slate-500"
                }`}
              >
                <LayoutGrid size={15} />
                Matriz
              </button>
            </div>

            {permisos.crearTarea && (
              <button
                type="button"
                onClick={() => setModalCrearAbierto(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-md sm:ml-auto sm:w-auto"
              >
                <Plus size={16} />
                Nueva tarea
              </button>
            )}
          </div>
        </header>

        {cargando ? (
          <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-700 border-t-transparent" />
          </div>
        ) : !tareas.length ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
            <CheckCircle2 size={44} className="mx-auto text-emerald-400" />

            <p className="mt-3 text-lg font-black text-slate-700">
              No hay tareas para mostrar
            </p>
          </div>
        ) : vista === "MATRIZ" ? (
          <TaskMatrix
            tareas={tareas}
            procesandoId={procesandoId}
            onAbrirDetalle={abrirDetalle}
            onCambiarEstado={cambiarEstado}
            onMoverTarea={moverTarea}
          />
        ) : (
          <TaskDateView
            tareas={tareas}
            procesandoId={procesandoId}
            onAbrirDetalle={abrirDetalle}
            onCambiarEstado={cambiarEstado}
          />
        )}
      </div>

      {modalCrearAbierto && usuarioActual && (
        <TaskFormModal
          usuarioActual={usuarioActual}
          usuarios={usuarios}
          onClose={() => setModalCrearAbierto(false)}
          onSaved={tareaCreada}
        />
      )}

      {tareaSeleccionada && (
        <TaskDetailModal
          key={tareaSeleccionada.id}
          tarea={tareaSeleccionada}
          usuarios={usuarios}
          procesando={String(procesandoId) === String(tareaSeleccionada.id)}
          onClose={() => setTareaSeleccionada(null)}
          onActualizar={actualizarTarea}
          onCambiarEstado={(estado) => cambiarEstado(tareaSeleccionada, estado)}
          onEliminar={eliminarTarea}
          onRetroalimentar={retroalimentar}
        />
      )}
    </>
  );
}
