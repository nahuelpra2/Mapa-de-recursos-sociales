import { useMemo, useState } from "react";
import { Filters } from "./components/Filters";
import { localResourceRepository } from "./data/localResourceRepository";
import { Header } from "./components/Header";
import { Notice } from "./components/Notice";
import { ReferenceCenterSelector } from "./components/ReferenceCenterSelector";
import { ResourceList } from "./components/ResourceList";
import { ResourceMap } from "./components/ResourceMap";
import { SearchBar } from "./components/SearchBar";
import { useFilteredResources } from "./hooks/useFilteredResources";
import { useGeolocation } from "./hooks/useGeolocation";
import { useResourceSearchState } from "./hooks/useResourceSearchState";
import type { ResourceWithDistance } from "./types/resource";
import { copyResourceToClipboard } from "./utils/clipboard";

function App() {
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const { location, status, error, requestLocation } = useGeolocation();

  const resources = useMemo(() => localResourceRepository.listResources(), []);

  const referenceCenters = useMemo(
    () => localResourceRepository.listReferenceCenters(),
    []
  );

  const populationOptions = useMemo(
    () => localResourceRepository.listPopulationOptions(),
    []
  );

  const {
    search,
    setSearch,
    filters,
    setFilters,
    clearFilters,
    origin,
    originLabel,
    selectedReferenceCenterId,
    clearReferenceCenterSelection,
    selectReferenceCenter
  } = useResourceSearchState({ location, referenceCenters });

  const filteredResources = useFilteredResources({
    resources,
    search,
    filters,
    origin
  });

  async function handleCopy(resource: ResourceWithDistance) {
    try {
      const ok = await copyResourceToClipboard(resource, origin || undefined);
      setCopyMessage(ok ? `Datos copiados: ${resource.nombre}` : "No se pudieron copiar los datos");
    } catch {
      setCopyMessage("No se pudieron copiar los datos");
    }

    window.setTimeout(() => setCopyMessage(null), 2600);
  }

  function handleUseLocation() {
    clearReferenceCenterSelection();
    requestLocation();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-4 md:px-6 md:py-6">
        <Header />
        <Notice />

        {copyMessage ? (
          <div
            role="status"
            className="fixed bottom-4 left-1/2 z-[1000] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white shadow-soft"
          >
            {copyMessage}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(28rem,1.25fr)] lg:items-start">
          <div className="space-y-4 lg:max-h-[calc(100vh-1.5rem)] lg:overflow-y-auto lg:pr-1">
            <SearchBar value={search} onChange={setSearch} onUseLocation={handleUseLocation} locationStatus={status} />

            {error ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                {error}
              </p>
            ) : null}

            <ReferenceCenterSelector
              centers={referenceCenters}
              selectedCenterId={selectedReferenceCenterId}
              onSelect={selectReferenceCenter}
            />

            <Filters filters={filters} populationOptions={populationOptions} onChange={setFilters} onClear={clearFilters} />

            <p className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
              {originLabel}
            </p>

            <div className="lg:hidden">
              <ResourceMap resources={filteredResources} origin={origin} />
            </div>

            <ResourceList resources={filteredResources} origin={origin || undefined} onCopy={handleCopy} />
          </div>

          <div className="hidden lg:sticky lg:top-6 lg:block">
            <ResourceMap resources={filteredResources} origin={origin} />
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
