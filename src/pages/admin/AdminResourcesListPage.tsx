import { Link } from "react-router-dom";
import { useAdminResources } from "../../hooks/useAdminResources";
import { resolveAdminResourceListPresentation } from "./adminResourceListPresentation";

export function AdminResourcesListPage() {
  const state = useAdminResources();
  const presentation = resolveAdminResourceListPresentation(state);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Recursos</p>
          <h2 className="mt-2 text-2xl font-bold">{presentation.title}</h2>
          <p className="mt-2 text-sm text-slate-300">{presentation.message}</p>
        </div>
        <Link to={presentation.createHref} className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-300">
          Crear recurso
        </Link>
      </div>

      {presentation.rows.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-950/60 text-left text-slate-300">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Dirección</th>
                <th className="px-4 py-3">Última actualización</th>
                <th className="px-4 py-3">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {presentation.rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-semibold text-slate-100">{row.name}</td>
                  <td className="px-4 py-3 text-slate-300">{row.type}</td>
                  <td className="px-4 py-3 text-slate-300">{row.address}</td>
                  <td className="px-4 py-3 text-slate-300">{row.updatedAt}</td>
                  <td className="px-4 py-3">
                    <Link to={row.editHref} className="font-semibold text-emerald-300 hover:text-emerald-200">
                      Editar
                    </Link>
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
