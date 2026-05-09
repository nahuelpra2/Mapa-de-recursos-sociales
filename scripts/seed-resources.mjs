import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { formatMissingSeedEnvMessage, mapResourcesToSupabaseSeedRows } from "./resourceSeedMapper.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const defaultResourcesPath = resolve(projectRoot, "src", "data", "resources.json");

function hasDryRunFlag(args) {
  return args.includes("--dry-run");
}

async function readResources(resourcesPath) {
  const raw = await readFile(resourcesPath, "utf8");
  return JSON.parse(raw);
}

function createSeedClient() {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(formatMissingSeedEnvMessage());
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

async function main() {
  const resourcesPath = process.env.SUPABASE_RESOURCES_JSON
    ? resolve(projectRoot, process.env.SUPABASE_RESOURCES_JSON)
    : defaultResourcesPath;
  const resources = await readResources(resourcesPath);
  const rows = mapResourcesToSupabaseSeedRows(resources);

  if (hasDryRunFlag(process.argv.slice(2))) {
    console.log(`Dry run OK: mapped ${rows.length} resources from ${resourcesPath}.`);
    console.log(`First resource id: ${rows[0]?.id ?? "none"}`);
    return;
  }

  const client = createSeedClient();
  const { error } = await client.from("resources").upsert(rows, { onConflict: "id" }).select("id");

  if (error) {
    throw new Error(`Supabase seed failed: ${error.message}`);
  }

  console.log(`Seeded ${rows.length} resources into public.resources.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
