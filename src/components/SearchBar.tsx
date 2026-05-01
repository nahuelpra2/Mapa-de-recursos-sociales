type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onUseLocation: () => void;
  locationStatus: "idle" | "loading" | "success" | "error";
};

export function SearchBar({ value, onChange, onUseLocation, locationStatus }: SearchBarProps) {
  const isLoading = locationStatus === "loading";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <label htmlFor="search" className="block text-sm font-semibold text-slate-800">
        Buscar por direccion, barrio o nombre del centro
      </label>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          id="search"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Ej.: Cordon, refugio, centro diurno..."
          className="min-h-12 flex-1 rounded-xl border border-slate-300 px-4 text-base outline-none transition focus:border-sky-600 focus:ring-4 focus:ring-sky-100"
        />
        <button
          type="button"
          onClick={onUseLocation}
          disabled={isLoading}
          className="min-h-12 rounded-xl bg-sky-700 px-5 text-base font-semibold text-white transition hover:bg-sky-800 focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isLoading ? "Buscando..." : "Usar mi ubicacion"}
        </button>
      </div>
    </section>
  );
}
