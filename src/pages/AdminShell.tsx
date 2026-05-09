import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/useAdminAuth";

export function AdminShell() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <section className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Panel admin</p>
            <h1 className="mt-2 text-2xl font-bold">Administración de recursos</h1>
            <p className="mt-2 text-sm text-slate-300">Placeholder seguro: CRUD de recursos queda fuera de Phase 4.</p>
          </div>
          <button onClick={handleLogout} className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-bold hover:bg-slate-800">
            Cerrar sesión
          </button>
        </div>
      </section>
    </main>
  );
}
