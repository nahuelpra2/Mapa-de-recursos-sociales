import { describe, expect, it } from "vitest";
import { getResourceMaintenanceReviewDisplay } from "./resourceVerification";

describe("getResourceMaintenanceReviewDisplay", () => {
  const today = new Date(2026, 4, 8, 23, 59);

  function maintenance(reviewBy: string) {
    return {
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
