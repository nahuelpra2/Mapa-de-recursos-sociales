import type { Coordinates, ResourceWithDistance } from "../types/resource";
import { ResourceCard } from "./ResourceCard";

type ResourceListProps = {
  resources: ResourceWithDistance[];
  origin?: Coordinates;
  onCopy: (resource: ResourceWithDistance) => void;
};

export function ResourceList({ resources, origin, onCopy }: ResourceListProps) {
  return (
    <section aria-labelledby="resource-list-title" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 id="resource-list-title" className="text-xl font-bold text-slate-950">
          Resultados
        </h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
          {resources.length} recursos
        </span>
      </div>

      {resources.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600">
          No hay recursos que coincidan con la busqueda o los filtros seleccionados.
        </div>
      ) : (
        <div className="space-y-4">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} origin={origin} onCopy={onCopy} />
          ))}
        </div>
      )}
    </section>
  );
}
