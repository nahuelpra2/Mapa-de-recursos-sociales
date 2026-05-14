import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migrationPath = new URL("./20260514_add_resource_modalidad.sql", import.meta.url);

describe("add resource modalidad migration", () => {
  it("adds a nullable modalidad column with the approved catalog and backfill-first rollout notes", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain("add column if not exists modalidad text");
    expect(sql).toContain("modalidad is null or modalidad in (");
    expect(sql).toContain("COLMENA - Nocturno Hombres");
    expect(sql).toContain("Plan Nacional Invierno - Área Metropolitana");
    expect(sql).toContain("Plan Nacional Invierno - Puertas Abiertas");
    expect(sql).toContain("create index if not exists resources_modalidad_idx");
    expect(sql).toContain("backfill existing resources before any later not null hardening");
    expect(sql).toContain("nullable-first rollout");
  });
});
