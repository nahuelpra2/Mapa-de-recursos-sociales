import { z } from "zod";

const RESOURCE_DATA_ERROR_PREFIX = "Invalid bundled resource data";
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const resourceTypeSchema = z.enum([
  "Refugio nocturno",
  "Centro diurno",
  "Puerta abierta",
  "Centro de atención",
  "Otro"
]);

export const RESOURCE_MODALIDADES = [
  "COLMENA - Nocturnos Hombres",
  "COLMENA - Nocturno Mixto",
  "Nocturno Hombres",
  "Nocturno Mixto",
  "Nocturno Mujeres",
  "Plan Nacional Invierno - Area Metropolitana",
  "Plan Nacional Invierno",
  "Plan Nacional Invierno - Puertas Abiertas"
] as const;

export const resourceModalidadSchema = z.enum(RESOURCE_MODALIDADES);

const requiredTextSchema = z.string().min(1);
const optionalTextSchema = z.string().min(1).optional();

function isLeapYear(year: number): boolean {
  return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
}

function isRealIsoCalendarDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;

  const [yearPart, monthPart, dayPart] = value.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);
  const daysByMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  return month >= 1 && month <= 12 && day >= 1 && day <= daysByMonth[month - 1];
}

const isoDateSchema = z
  .string()
  .regex(ISO_DATE_PATTERN)
  .refine(isRealIsoCalendarDate, { message: "Invalid calendar date" });

export const resourceMaintenanceSchema = z
  .object({
    reviewBy: isoDateSchema
  })
  .strict();

export const resourceSchema = z
  .object({
    id: requiredTextSchema,
    nombre: requiredTextSchema,
    tipo: resourceTypeSchema,
    modalidad: resourceModalidadSchema.optional(),
    direccion: requiredTextSchema,
    barrio: optionalTextSchema,
    lat: z.number().finite().min(-90).max(90),
    lng: z.number().finite().min(-180).max(180),
    telefono: optionalTextSchema,
    horario: optionalTextSchema,
    poblacion: z.array(requiredTextSchema).min(1),
    esCentroReferencia: z.boolean(),
    observaciones: optionalTextSchema,
    fuente: requiredTextSchema,
    ultimaActualizacion: isoDateSchema,
    maintenance: resourceMaintenanceSchema
  })
  .strict();

export const resourcesSchema = z.array(resourceSchema);

export type ResourceTypeFromSchema = z.infer<typeof resourceTypeSchema>;
export type ResourceModalidadFromSchema = z.infer<typeof resourceModalidadSchema>;
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
