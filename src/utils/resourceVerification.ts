import type { Resource } from "../types/resource";

type ResourceVerification = Resource["verification"];

export type ResourceVerificationDisplay = {
  label: string;
  detail: string;
  tone: "success" | "warning";
};

export function getResourceVerificationDisplay(
  verification: ResourceVerification
): ResourceVerificationDisplay {
  if (verification.status === "verified") {
    return {
      label: "Verificado",
      detail: `Verificado el ${verification.verifiedAt}`,
      tone: "success"
    };
  }

  return {
    label: "Necesita revision",
    detail: "Pendiente de revision humana",
    tone: "warning"
  };
}
