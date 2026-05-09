import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../../context/useAdminAuth";
import { getRequireAdminDecision } from "./requireAdminDecision";

export function RequireAdmin({ children }: { children: JSX.Element }) {
  const { state } = useAdminAuth();
  const decision = getRequireAdminDecision(state);

  if (decision.type === "loading") {
    return <p className="min-h-screen bg-slate-950 p-6 text-sm font-semibold text-slate-100">Verificando sesión...</p>;
  }

  if (decision.type === "redirect") return <Navigate to={decision.to} replace />;

  if (decision.type === "denied") {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
        <section className="mx-auto max-w-md rounded-2xl border border-red-300/40 bg-red-950/40 p-5 shadow-soft">
          <h1 className="text-xl font-bold">Acceso denegado</h1>
          <p className="mt-2 text-sm text-red-100">{decision.message}</p>
        </section>
      </main>
    );
  }

  return children;
}
