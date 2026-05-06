import { describe, expect, it } from "vitest";
import { isOpenNow } from "./openingHours";

function dateAt(hours: number, minutes = 0) {
  return new Date(2024, 0, 1, hours, minutes);
}

describe("opening hours", () => {
  it("treats 24-hour schedules as open", () => {
    expect(isOpenNow("24 horas", dateAt(3))).toBe(true);
    expect(isOpenNow("Atencion 24hs", dateAt(22))).toBe(true);
  });

  it("detects current open state for same-day ranges", () => {
    expect(isOpenNow("08:00 a 16:00", dateAt(8))).toBe(true);
    expect(isOpenNow("08:00 a 16:00", dateAt(12))).toBe(true);
    expect(isOpenNow("08:00 a 16:00", dateAt(17))).toBe(false);
  });

  it("supports overnight ranges", () => {
    expect(isOpenNow("20:00 a 08:00", dateAt(23))).toBe(true);
    expect(isOpenNow("20:00 a 08:00", dateAt(6))).toBe(true);
    expect(isOpenNow("20:00 a 08:00", dateAt(12))).toBe(false);
  });

  it("returns false for missing or unparseable schedules", () => {
    expect(isOpenNow(undefined, dateAt(12))).toBe(false);
    expect(isOpenNow("consultar", dateAt(12))).toBe(false);
  });
});
