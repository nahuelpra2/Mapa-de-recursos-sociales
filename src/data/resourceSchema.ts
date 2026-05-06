import { z } from "zod";

const RESOURCE_DATA_ERROR_PREFIX = "Invalid bundled resource data";

export const resourceTypeSchema = z.enum([
  "Refugio nocturno",
  "Centro diurno",
  "Puerta abierta",
  "Centro de atención",
  "Otro"
]);

const requiredTextSchema = z.string().min(1);
const optionalTextSchema = z.string().min(1).optional();

export const resourceSchema = z
  .object({
    id: requiredTextSchema,
    nombre: requiredTextSchema,
    tipo: resourceTypeSchema,
    direccion: requiredTextSchema,
    barrio: optionalTextSchema,
    lat: z.number().finite().min(-90).max(90),
    lng: z.number().finite().min(-180).max(180),
    telefono: optionalTextSchema,
    horario: optionalTextSchema,
    poblacion: z.array(requiredTextSchema).min(1),
    requiereDerivacion: z.boolean(),
    accesoDirecto: z.boolean(),
    observaciones: optionalTextSchema,
    fuente: requiredTextSchema,
    ultimaActualizacion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    esCentroReferencia: z.boolean().optional()
  })
  .strict();

export const resourcesSchema = z.array(resourceSchema);

export type ResourceTypeFromSchema = z.infer<typeof resourceTypeSchema>;
export type ResourceFromSchema = z.infer<typeof resourceSchema>;

function formatIssuePath(path: PropertyKey[]): string {
  if (path.length === 0) return "resources.json";

  return path.reduce<string>((formattedPath, segment) => {
    if (typeof segment === "number") return `${formattedPath}[${segment}]`;

    return `${formattedPath}.${String(segment)}`;
  }, "resources.json");
}

export function formatResourceDataValidationError(error: z.ZodError): string {
  const issueMessages = error.issues.map(
    (issue) => `- ${formatIssuePath(issue.path)}: ${issue.message}`
  );

  return [
    `${RESOURCE_DATA_ERROR_PREFIX}: resources.json failed validation.`,
    "Fix the bundled data before shipping; the app will not render partial or unsafe resource records.",
    ...issueMessages
  ].join("\n");
}

export class ResourceDataValidationError extends Error {
  readonly cause: z.ZodError;

  constructor(error: z.ZodError) {
    super(formatResourceDataValidationError(error));
    this.name = "ResourceDataValidationError";
    this.cause = error;
  }
}

export function validateResources(data: unknown): ResourceFromSchema[] {
  const result = resourcesSchema.safeParse(data);

  if (!result.success) {
    throw new ResourceDataValidationError(result.error);
  }

  return result.data;
}
