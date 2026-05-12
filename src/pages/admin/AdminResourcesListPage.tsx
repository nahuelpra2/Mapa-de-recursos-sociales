import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { adminResourceRepository } from "../../data/adminResourceRepository";
import type { AdminResource } from "../../data/adminResourceSchema";
import { submitAdminResourceLifecycleAction, useAdminResources } from "../../hooks/useAdminResources";
import { resolveAdminResourceListPresentation } from "./adminResourceListPresentation";

export function AdminResourcesListPage() {
  const state = useAdminResources();
  const [resources, setResources] = useState<AdminResource[]>([]);
  const [lifecycleState, setLifecycleState] = useState<{ status: "idle" | "confirming-delete" | "success" | "error"; pendingDeleteId: string | null; message: string | null }>({
    status: "idle",
    pendingDeleteId: null,
    message: null
  });

  useEffect(() => {
    if (state.status === "success" || state.status === "empty") {
      setResources(state.resources);
    }
  }, [state.resources, state.status]);

  const presentation = resolveAdminResourceListPresentation({ ...state, resources }, lifecycleState);

  async function handleArchive(id: string) {
    setLifecycleState({ status: "idle", pendingDeleteId: null, message: null });
    const result = await submitAdminResourceLifecycleAction({ action: "archive", id, repository: adminResourceRepository });

    if (result.status === "success" && result.resource) {
      setResources((current) => current.map((resource) => (resource.id === id ? result.resource! : resource)));
      setLifecycleState({ status: "success", pendingDeleteId: null, message: "Recurso archivado. La lista se actualizó." });
      return;
    }

    setLifecycleState({ status: "error", pendingDeleteId: null, message: result.formError });
  }

  function requestDelete(id: string) {
    setLifecycleState({ status: "confirming-delete", pendingDeleteId: id, message: "Eliminar definitivamente es irreversible. Confirmá para continuar." });
  }

  function cancelDelete() {
    setLifecycleState({ status: "idle", pendingDeleteId: null, message: null });
  }

  async function confirmDelete() {
    if (!lifecycleState.pendingDeleteId) return;

    const id = lifecycleState.pendingDeleteId;
    const result = await submitAdminResourceLifecycleAction({ action: "delete", id, confirmed: true, repository: adminResourceRepository });

    if (result.status === "success") {
      setResources((current) => current.filter((resource) => resource.id !== id));
      setLifecycleState({ status: "success", pendingDeleteId: null, message: "Recurso eliminado definitivamente. La lista se actualizó." });
      return;
    }

    setLifecycleState({ status: "error", pendingDeleteId: null, message: result.formError });
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Recursos</p>
          <h2 className="mt-2 text-2xl font-bold">{presentation.title}</h2>
          <p className="mt-2 text-sm text-slate-300">{presentation.message}</p>
          {presentation.lifecycleMessage ? (
            <p className={`mt-3 text-sm ${presentation.lifecycleTone === "error" ? "text-rose-200" : presentation.lifecycleTone === "success" ? "text-emerald-200" : "text-amber-200"}`}>
              {presentation.lifecycleMessage}
            </p>
          ) : null}
        </div>
        <Link to={presentation.createHref} className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-300">
          Crear recurso
        </Link>
      </div>

      {presentation.pendingDeleteId ? (
        <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-100">
          <p className="font-semibold">Eliminar definitivamente es irreversible.</p>
          <p className="mt-1">Confirmá para continuar con la eliminación del recurso seleccionado.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" onClick={confirmDelete} className="rounded-xl bg-rose-400 px-4 py-2 font-semibold text-slate-950 hover:bg-rose-300">
              Confirmar eliminación
            </button>
            <button type="button" onClick={cancelDelete} className="rounded-xl border border-slate-700 px-4 py-2 font-semibold text-slate-100 hover:border-slate-500">
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      {presentation.rows.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-950/60 text-left text-slate-300">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Dirección</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Última actualización</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {presentation.rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-semibold text-slate-100">{row.name}</td>
                  <td className="px-4 py-3 text-slate-300">{row.type}</td>
                  <td className="px-4 py-3 text-slate-300">{row.address}</td>
                  <td className="px-4 py-3 text-slate-300">{row.statusLabel}</td>
                  <td className="px-4 py-3 text-slate-300">{row.updatedAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-3">
                      <Link to={row.editHref} className="font-semibold text-emerald-300 hover:text-emerald-200">
                        Editar
                      </Link>
                      <button type="button" onClick={() => handleArchive(row.id)} disabled={row.archive.disabled} className="font-semibold text-amber-300 hover:text-amber-200 disabled:cursor-not-allowed disabled:text-slate-500">
                        {row.archive.label}
                      </button>
                      <button type="button" onClick={() => requestDelete(row.id)} className="font-semibold text-rose-300 hover:text-rose-200">
                        {row.delete.label}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
