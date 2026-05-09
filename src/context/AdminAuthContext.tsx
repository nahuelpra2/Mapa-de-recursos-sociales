import { useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  loadingAdminState,
  restoreAdminSession,
  signInAdmin,
  signOutAdmin,
  type AdminAuthClient,
  type AdminAuthState
} from "../lib/adminAuth";
import { AdminAuthContext, type AdminAuthContextValue } from "./adminAuthContextValue";

export function AdminAuthProvider({ children, client = supabase as AdminAuthClient | null }: { children: ReactNode; client?: AdminAuthClient | null }) {
  const [state, setState] = useState<AdminAuthState>(loadingAdminState);

  useEffect(() => {
    let active = true;

    restoreAdminSession(client).then((nextState) => {
      if (active) setState(nextState);
    });

    return () => {
      active = false;
    };
  }, [client]);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      state,
      async login(email, password) {
        if (!client) {
          const nextState: AdminAuthState = {
            status: "error",
            session: null,
            isAdmin: false,
            error: "Supabase no está configurado."
          };
          setState(nextState);
          return nextState;
        }

        const nextState = await signInAdmin(client, email, password);
        setState(nextState);
        return nextState;
      },
      async logout() {
        const nextState = await signOutAdmin(client);
        setState(nextState);
        return nextState;
      }
    }),
    [client, state]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
