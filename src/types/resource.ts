export type ResourceType =
  | "Refugio nocturno"
  | "Centro diurno"
  | "Puerta abierta"
  | "Centro de atenci\u00f3n"
  | "Otro";

export type Coordinates = {
  lat: number;
  lng: number;
};

export type Resource = {
  id: string;
  nombre: string;
  tipo: ResourceType;
  direccion: string;
  barrio?: string;
  lat: number;
  lng: number;
  telefono?: string;
  horario?: string;
  poblacion: string[];
  requiereDerivacion: boolean;
  accesoDirecto: boolean;
  observaciones?: string;
  fuente: string;
  ultimaActualizacion: string;
  esCentroReferencia?: boolean;
};

export type ResourceWithDistance = Resource & {
  distanceKm?: number;
};

export type FiltersState = {
  tipo: ResourceType | "";
  poblacion: string;
  abiertoAhora: boolean;
  requiereDerivacion: boolean;
  accesoDirecto: boolean;
};

export type OriginMode = "current-location" | "reference-center";

export type SearchOrigin = Coordinates & {
  label: string;
  mode: OriginMode;
};
