import type { Resource } from "../../types/resource";
import { RESOURCE_MODALIDADES } from "../../data/resourceSchema";

export function createResource(overrides: Partial<Resource> = {}): Resource {
  return {
    id: "resource-fixture",
    nombre: "Recurso fixture",
    tipo: "Centro de atención",
    modalidad: RESOURCE_MODALIDADES[0],
    direccion: "Calle Fixture 123",
    barrio: "Barrio fixture",
    lat: -34.6037,
    lng: -58.3816,
    telefono: "011 0000-0000",
    horario: "Lunes a viernes de 9:00 a 17:00",
    poblacion: ["Personas adultas"],
    esCentroReferencia: true,
    observaciones: "Observacion fixture",
    fuente: "Fixture de test",
    ultimaActualizacion: "2026-05-01",
    maintenance: {
      reviewBy: "2026-12-31"
    },
    ...overrides
  };
}
