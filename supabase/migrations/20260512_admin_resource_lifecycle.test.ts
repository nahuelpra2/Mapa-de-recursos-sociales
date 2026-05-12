import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migrationPath = new URL("./20260512_admin_resource_lifecycle.sql", import.meta.url);

describe("admin resource lifecycle migration", () => {
  it("declares an admin-only delete policy and updates the physical delete comment", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain('create policy "Admins can delete resources"');
    expect(sql).toContain("for delete");
    expect(sql).toContain("using (public.is_admin())");
    expect(sql).toContain("physical row removal is intentionally exposed");
  });
});
