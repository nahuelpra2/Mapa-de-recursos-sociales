import { describe, expect, it } from "vitest";
import { getResourceVerificationDisplay } from "./resourceVerification";

describe("getResourceVerificationDisplay", () => {
  it("describes verified resources with their verification date", () => {
    expect(
      getResourceVerificationDisplay({
        status: "verified",
        verifiedAt: "2026-05-01",
        source: "Llamada telefonica"
      })
    ).toEqual({
      label: "Verificado",
      detail: "Verificado el 2026-05-01",
      tone: "success"
    });
  });

  it("describes resources pending human review", () => {
    expect(
      getResourceVerificationDisplay({
        status: "needs_review",
        source: "Dato importado pendiente"
      })
    ).toEqual({
      label: "Necesita revision",
      detail: "Pendiente de revision humana",
      tone: "warning"
    });
  });
});
