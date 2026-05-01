import type { Coordinates, ResourceWithDistance } from "../types/resource";
import { formatDistance } from "../utils/distance";
import { createMapLink } from "../utils/maps";
import { isOpenNow } from "../utils/openingHours";

type ResourceCardProps = {
  resource: ResourceWithDistance;
  origin?: Coordinates;
  onCopy: (resource: ResourceWithDistance) => void;
};

export function ResourceCard({ resource, origin, onCopy }: ResourceCardProps) {
  const mapLink = createMapLink(resource, origin);
  const openNow = isOpenNow(resource.horario);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-sky-700">{resource.tipo}</p>
          <h3 className="mt-1 text-xl font-bold text-slate-950">{resource.nombre}</h3>
        </div>
        <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800">
          {formatDistance(resource.distanceKm)}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 text-sm text-slate-700">
        <InfoRow label="Direccion" value={`${resource.direccion}${resource.barrio ? `, ${resource.barrio}` : ""}`} />
        <InfoRow label="Horario" value={resource.horario || "No informado"} />
        <InfoRow label="Telefono" value={resource.telefono || "No informado"} />
        <InfoRow label="Poblacion" value={resource.poblacion.join(", ")} />
        <InfoRow
          label="Acceso"
          value={[
            resource.requiereDerivacion ? "Requiere derivacion" : "No requiere derivacion informada",
            resource.accesoDirecto ? "Acceso directo" : "Sin acceso directo informado"
          ].join(". ")}
        />
        {resource.observaciones ? <InfoRow label="Observaciones" value={resource.observaciones} /> : null}
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
          {openNow ? "Abierto ahora" : "Verificar horario"}
        </span>
        {resource.esCentroReferencia ? (
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-800 ring-1 ring-indigo-200">
            Centro de referencia
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <a
          href={mapLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-sky-700 px-4 text-sm font-bold text-sky-800 transition hover:bg-sky-50 focus:outline-none focus:ring-4 focus:ring-sky-100"
        >
          Como llegar
        </a>
        <button
          type="button"
          onClick={() => onCopy(resource)}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
        >
          Copiar datos
        </button>
      </div>

      <footer className="mt-4 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">
        <p>Fuente: {resource.fuente}</p>
        <p>Ultima actualizacion: {resource.ultimaActualizacion}</p>
      </footer>
    </article>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="grid gap-1 sm:grid-cols-[9rem_1fr]">
      <dt className="font-bold text-slate-900">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
