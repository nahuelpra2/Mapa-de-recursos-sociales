import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const defaultInputPath = resolve(projectRoot, "src", "data", "resources-pending-geocoding.json");
const defaultOutputPath = resolve(projectRoot, "src", "data", "resources-geocoded.json");
const geocodeEndpoint = "https://direcciones.ide.uy/api/v1/geocode/direcUnica";

function parseArgs(args) {
  const options = {
    input: defaultInputPath,
    output: defaultOutputPath,
    dryRun: false,
    limit: null,
    delayMs: 250
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--input") options.input = resolve(projectRoot, args[++index]);
    else if (arg === "--output") options.output = resolve(projectRoot, args[++index]);
    else if (arg === "--limit") options.limit = Number(args[++index]);
    else if (arg === "--delay-ms") options.delayMs = Number(args[++index]);
  }

  return options;
}

function removeDiacritics(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function withoutCornerReference(value) {
  return normalizeWhitespace(value.replace(/\s+esq\.?\s+.+$/i, ""));
}

function buildQueryVariants(resource) {
  const base = normalizeWhitespace(resource.direccion ?? "");
  const withoutCorner = withoutCornerReference(base);
  const variants = [base, withoutCorner, removeDiacritics(base), removeDiacritics(withoutCorner)]
    .filter(Boolean)
    .flatMap((query) => [query, `${query}, Montevideo`]);

  return [...new Set(variants)];
}

function isMontevideoCandidate(candidate) {
  return removeDiacritics(candidate.departamento ?? "").toUpperCase() === "MONTEVIDEO";
}

function classifyCandidates(candidates) {
  const montevideoCandidates = candidates.filter(isMontevideoCandidate);
  const exactCandidates = montevideoCandidates.filter((candidate) => candidate.state === 1 && candidate.stateMsg === "");

  if (exactCandidates.length === 1) {
    return { status: "matched", selected: exactCandidates[0], candidates: montevideoCandidates };
  }

  if (montevideoCandidates.length > 0) {
    return { status: "ambiguous", selected: montevideoCandidates[0], candidates: montevideoCandidates };
  }

  return { status: "not_found", selected: null, candidates: [] };
}

async function geocodeQuery(query) {
  const url = new URL(geocodeEndpoint);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "5");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`IDE geocoding failed (${response.status}) for query: ${query}`);
  }

  return response.json();
}

async function geocodeResource(resource) {
  const queries = buildQueryVariants(resource);

  for (const query of queries) {
    const candidates = await geocodeQuery(query);
    const result = classifyCandidates(candidates);

    if (result.status !== "not_found") {
      return {
        ...resource,
        lat: result.status === "matched" ? result.selected.lat : null,
        lng: result.status === "matched" ? result.selected.lng : null,
        geocoding: {
          status: result.status,
          source: "direcciones.ide.uy",
          query,
          selected: result.selected,
          candidateCount: result.candidates.length
        }
      };
    }
  }

  return {
    ...resource,
    lat: null,
    lng: null,
    geocoding: {
      status: "not_found",
      source: "direcciones.ide.uy",
      query: queries[0] ?? "",
      selected: null,
      candidateCount: 0
    }
  };
}

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

function summarize(resources) {
  return resources.reduce(
    (summary, resource) => {
      const status = resource.geocoding?.status ?? "pending";
      summary[status] = (summary[status] ?? 0) + 1;
      return summary;
    },
    { matched: 0, ambiguous: 0, not_found: 0 }
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const resources = JSON.parse(await readFile(options.input, "utf8"));
  const targetResources = options.limit ? resources.slice(0, options.limit) : resources;
  const geocoded = [];

  for (const resource of targetResources) {
    geocoded.push(await geocodeResource(resource));
    await delay(options.delayMs);
  }

  const summary = summarize(geocoded);
  console.log(
    `Geocoding ${options.dryRun ? "dry run" : "completed"}: ${geocoded.length} resources, ` +
      `${summary.matched} matched, ${summary.ambiguous} ambiguous, ${summary.not_found} not found.`
  );

  if (options.dryRun) return;

  await writeFile(options.output, `${JSON.stringify(geocoded, null, 2)}\n`, "utf8");
  console.log(`Wrote ${options.output}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
