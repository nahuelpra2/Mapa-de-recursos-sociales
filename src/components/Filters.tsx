import type { FiltersState, ResourceType } from "../types/resource";

const resourceTypes: ResourceType[] = [
  "Refugio nocturno",
  "Centro diurno",
  "Puerta abierta",
  "Centro de atenci\u00f3n",
  "Otro"
];

type FiltersProps = {
  filters: FiltersState;
  populationOptions: string[];
  onChange: (filters: FiltersState) => void;
  onClear: () => void;
};

export function Filters({ filters, populationOptions, onChange, onClear }: FiltersProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">Filtros</h2>
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50 focus:outline-none focus:ring-4 focus:ring-sky-100"
        >
          Limpiar
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-800">
          Tipo de recurso
          <select
            value={filters.tipo}
            onChange={(event) => onChange({ ...filters, tipo: event.target.value as FiltersState["tipo"] })}
            className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 outline-none transition focus:border-sky-600 focus:ring-4 focus:ring-sky-100"
          >
            <option value="">Todos</option>
            {resourceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-semibold text-slate-800">
          Poblacion atendida
          <select
            value={filters.poblacion}
            onChange={(event) => onChange({ ...filters, poblacion: event.target.value })}
            className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 outline-none transition focus:border-sky-600 focus:ring-4 focus:ring-sky-100"
          >
            <option value="">Todas</option>
            {populationOptions.map((population) => (
              <option key={population} value={population}>
                {population}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <FilterCheckbox
          label="Abierto ahora"
          checked={filters.abiertoAhora}
          onChange={(checked) => onChange({ ...filters, abiertoAhora: checked })}
        />
        <FilterCheckbox
          label="Requiere derivacion"
          checked={filters.requiereDerivacion}
          onChange={(checked) => onChange({ ...filters, requiereDerivacion: checked })}
        />
        <FilterCheckbox
          label="Acceso directo"
          checked={filters.accesoDirecto}
          onChange={(checked) => onChange({ ...filters, accesoDirecto: checked })}
        />
      </div>
    </section>
  );
}

type FilterCheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function FilterCheckbox({ label, checked, onChange }: FilterCheckboxProps) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 rounded border-slate-300 text-sky-700 focus:ring-sky-600"
      />
      {label}
    </label>
  );
}
