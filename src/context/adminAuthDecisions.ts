import type { AdminAuthState } from "../lib/adminAuth";

type LoginRouteDecision = { type: "show-login" } | { type: "redirect"; to: "/admin" };

export function getLoginRouteDecision(state: AdminAuthState): LoginRouteDecision {
  return state.status === "admin" ? { type: "redirect", to: "/admin" } : { type: "show-login" };
}
