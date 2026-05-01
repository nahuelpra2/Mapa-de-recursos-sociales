import type { Resource } from "../types/resource";

type ReferenceCenterSelectorProps = {
  centers: Resource[];
  selectedCenterId: string;
  onSelect: (centerId: string) => void;
};

export function ReferenceCenterSelector({ centers, selectedCenterId, onSelect }: ReferenceCenterSelectorProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <label htmlFor="reference-center" className="block text-sm font-semibold text-slate-800">
        Estoy trabajando en
      </label>
      <select
        id="reference-center"
        value={selectedCenterId}
        onChange={(event) => onSelect(event.target.value)}
        className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-sky-600 focus:ring-4 focus:ring-sky-100"
      >
        <option value="">Seleccionar centro de referencia</option>
        {centers.map((center) => (
          <option key={center.id} value={center.id}>
            {center.nombre} - {center.barrio || center.direccion}
          </option>
        ))}
      </select>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Util para computadoras de trabajo donde la ubicacion del navegador puede no ser precisa.
      </p>
    </section>
  );
}
