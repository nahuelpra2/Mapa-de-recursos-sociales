import { ResourceDataValidationError } from "../data/resourceSchema";

export type DataLoadErrorViewModel = {
  title: string;
  message: string;
  technicalDetail?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorName(error: unknown): string | undefined {
  if (error instanceof Error) return error.name;
  if (isRecord(error) && typeof error.name === "string") return error.name;

  return undefined;
}

function getErrorMessage(error: unknown): string | undefined {
  if (error instanceof Error) return error.message;
  if (isRecord(error) && typeof error.message === "string") return error.message;
  if (typeof error === "string") return error;

  return undefined;
}

export function isResourceDataLoadError(error: unknown): boolean {
  const name = getErrorName(error);
  const message = getErrorMessage(error) ?? "";

  return (
    error instanceof ResourceDataValidationError ||
    name === "ResourceDataValidationError" ||
    message.includes("Invalid bundled resource data") ||
    message.includes("resources.json")
  );
}

export function getConciseTechnicalDetail(error: unknown): string | undefined {
  const message = getErrorMessage(error);

  if (!message) return undefined;

  return message.split("\n").find((line) => line.trim().length > 0)?.trim();
}

export function getDataLoadErrorViewModel(error: unknown, showTechnicalDetail: boolean): DataLoadErrorViewModel {
  const resourceDataError = isResourceDataLoadError(error);
  const technicalDetail = showTechnicalDetail ? getConciseTechnicalDetail(error) : undefined;

  return {
    title: resourceDataError ? "No se pudieron cargar los recursos" : "No se pudo mostrar el mapa",
    message: resourceDataError
      ? "Los datos de recursos no pudieron cargarse o no pasaron la validación. Este mapa es una iniciativa independiente y no oficial; para evitar mostrar información incompleta o insegura, la aplicación se detuvo hasta que se corrijan los datos."
      : "Ocurrió un problema inesperado al preparar el mapa de recursos. Este mapa es una iniciativa independiente y no oficial; probá recargar la página o avisale a quien mantiene el proyecto.",
    technicalDetail
  };
}
