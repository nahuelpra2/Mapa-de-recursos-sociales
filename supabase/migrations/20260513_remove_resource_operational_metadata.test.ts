import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migrationPath = new URL("./20260513_remove_resource_operational_metadata.sql", import.meta.url);

describe("remove resource operational metadata migration", () => {
  it("drops the deprecated verification and maintenance columns idempotently", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain("drop column if exists verification_status cascade");
    expect(sql).toContain("drop column if exists verification_verified_at cascade");
    expect(sql).toContain("drop column if exists verification_source cascade");
    expect(sql).toContain("drop column if exists verification_notes cascade");
    expect(sql).toContain("drop column if exists maintenance_owner cascade");
    expect(sql).toContain("drop column if exists maintenance_notes cascade");
  });
});
