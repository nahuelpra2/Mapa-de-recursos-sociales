import type { AdminAuthState } from "../../lib/adminAuth";

type RequireAdminDecision =
  | { type: "loading" }
  | { type: "redirect"; to: "/admin/login" }
  | { type: "denied"; message: string }
  | { type: "allow" };

export function getRequireAdminDecision(state: AdminAuthState): RequireAdminDecision {
  if (state.status === "loading") return { type: "loading" };
  if (state.status === "admin") return { type: "allow" };
  if (state.status === "denied") return { type: "denied", message: state.error ?? "No tenés permisos de administración." };

  return { type: "redirect", to: "/admin/login" };
}
