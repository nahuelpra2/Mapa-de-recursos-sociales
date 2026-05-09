import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { getLoginRouteDecision } from "../context/adminAuthDecisions";
import { useAdminAuth } from "../context/useAdminAuth";

export function AdminLoginPage() {
  const { state, login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const decision = getLoginRouteDecision(state);

  if (decision.type === "redirect") return <Navigate to={decision.to} replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    await login(email, password);
    setSubmitting(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-slate-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Administración</p>
        <h1 className="mt-2 text-2xl font-bold">Ingresar al panel</h1>
        <p className="mt-2 text-sm text-slate-300">Usá una cuenta creada externamente y habilitada como admin.</p>

        <label className="mt-5 block text-sm font-semibold" htmlFor="admin-email">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
        />

        <label className="mt-4 block text-sm font-semibold" htmlFor="admin-password">
          Contraseña
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
        />

        {state.error ? <p className="mt-4 rounded-xl bg-red-950 px-3 py-2 text-sm text-red-100">{state.error}</p> : null}

        <button
          type="submit"
          disabled={submitting || state.status === "loading"}
          className="mt-5 w-full rounded-xl bg-emerald-400 px-4 py-2 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting || state.status === "loading" ? "Verificando..." : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
