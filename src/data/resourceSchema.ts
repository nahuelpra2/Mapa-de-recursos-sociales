import { z } from "zod";

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

export function validateResources(data: unknown): ResourceFromSchema[] {
  return resourcesSchema.parse(data);
}
