import { createContext } from "react";
import type { AdminAuthState } from "../lib/adminAuth";

export type AdminAuthContextValue = {
  state: AdminAuthState;
  login(email: string, password: string): Promise<AdminAuthState>;
  logout(): Promise<AdminAuthState>;
};

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);
