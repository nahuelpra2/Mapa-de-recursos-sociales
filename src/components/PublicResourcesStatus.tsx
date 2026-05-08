import type { PublicResourcesLoadStatus } from "../hooks/usePublicResources";

type PublicResourcesStatusProps = {
  status: PublicResourcesLoadStatus;
  error: string | null;
};

export function PublicResourcesStatus({ status, error }: PublicResourcesStatusProps) {
  if (status === "loading") {
    return (
      <p role="status" className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">
        Cargando recursos...
      </p>
    );
  }

  if (status === "error" && error) {
    return (
      <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
        {error}
      </p>
    );
  }

  return null;
}
