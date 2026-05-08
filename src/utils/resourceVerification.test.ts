import { describe, expect, it } from "vitest";
import {
  getResourceMaintenanceReviewDisplay,
  getResourceVerificationDisplay
} from "./resourceVerification";

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

describe("getResourceMaintenanceReviewDisplay", () => {
  const today = new Date(2026, 4, 8, 23, 59);

  function maintenance(reviewBy: string) {
    return {
      owner: "Equipo de prueba",
      reviewBy
    };
  }

  it("requires review when reviewBy is before the local calendar date", () => {
    expect(getResourceMaintenanceReviewDisplay(maintenance("2026-05-07"), today)).toEqual({
      label: "Revisar datos",
      detail: "Revision vencida el 2026-05-07. La informacion puede estar desactualizada.",
      requiresReview: true
    });
  });

  it("keeps the review current when reviewBy is today", () => {
    expect(getResourceMaintenanceReviewDisplay(maintenance("2026-05-08"), today)).toEqual({
      label: "Revision vigente",
      detail: "Revisar antes de 2026-05-08",
      requiresReview: false
    });
  });

  it("keeps the review current when reviewBy is in the future", () => {
    expect(getResourceMaintenanceReviewDisplay(maintenance("2026-05-09"), today)).toEqual({
      label: "Revision vigente",
      detail: "Revisar antes de 2026-05-09",
      requiresReview: false
    });
  });

  it("requires review when reviewBy is not a real calendar date", () => {
    expect(getResourceMaintenanceReviewDisplay(maintenance("2026-02-30"), today)).toEqual({
      label: "Revisar datos",
      detail: "Fecha de revision invalida. La informacion puede estar desactualizada.",
      requiresReview: true
    });
  });
});
