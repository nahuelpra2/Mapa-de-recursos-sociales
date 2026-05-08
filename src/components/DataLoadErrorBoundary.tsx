import { Component, type ErrorInfo, type ReactNode } from "react";
import { getDataLoadErrorViewModel } from "../utils/dataLoadError";

type DataLoadErrorBoundaryProps = {
  children: ReactNode;
};

type DataLoadErrorBoundaryState = {
  error: unknown;
};

export function DataLoadErrorFallback({ error }: { error: unknown }) {
  const viewModel = getDataLoadErrorViewModel(error, import.meta.env.DEV);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <section className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-700">Mapa de recursos sociales</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">{viewModel.title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-700">{viewModel.message}</p>
        <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 ring-1 ring-amber-200">
          Si necesitás asistencia urgente, no dependas únicamente de este mapa: contactá canales locales de atención o
          emergencia.
        </p>
        {viewModel.technicalDetail ? (
          <details className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
            <summary className="cursor-pointer font-semibold text-slate-900">Detalle técnico para desarrollo</summary>
            <p className="mt-2 font-mono text-xs">{viewModel.technicalDetail}</p>
          </details>
        ) : null}
      </section>
    </main>
  );
}

export class DataLoadErrorBoundary extends Component<DataLoadErrorBoundaryProps, DataLoadErrorBoundaryState> {
  state: DataLoadErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): DataLoadErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("Failed to render resource map", error, errorInfo.componentStack);
    }
  }

  render() {
    if (this.state.error) {
      return <DataLoadErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
