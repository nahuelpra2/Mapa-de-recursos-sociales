export function Header() {
  return (
    <header className="rounded-3xl bg-slate-900 px-5 py-6 text-white shadow-soft md:px-8">
      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-sky-200">MVP publico</p>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Mapa de recursos sociales</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-200">
            Encuentra refugios, centros diurnos, puertas abiertas y otros dispositivos cercanos usando informacion publica.
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 ring-1 ring-white/20">
          Sin login, sin backend y sin datos personales
        </span>
      </div>
    </header>
  );
}
