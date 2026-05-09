import { useContext } from "react";
import { anonymousAdminState } from "../lib/adminAuth";
import { AdminAuthContext, type AdminAuthContextValue } from "./adminAuthContextValue";

export function useAdminAuth(): AdminAuthContextValue {
  const value = useContext(AdminAuthContext);
  if (!value) {
    return {
      state: anonymousAdminState,
      async login() {
        return anonymousAdminState;
      },
      async logout() {
        return anonymousAdminState;
      }
    };
  }

  return value;
}
