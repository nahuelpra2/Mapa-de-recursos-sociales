import type { AdminResourceFieldErrors } from "../../hooks/useAdminResources";

export type AdminResourceFormMode = "create" | "edit";

export type AdminResourceFormFieldName =
  | "nombre"
  | "tipo"
  | "direccion"
  | "barrio"
  | "lat"
  | "lng"
  | "telefono"
  | "horario"
  | "poblacion"
  | "fuente"
  | "ultimaActualizacion"
  | "maintenance.reviewBy"
  | "observaciones"
  | "esCentroReferencia";

export type AdminResourceFormField = {
  name: AdminResourceFormFieldName;
  label: string;
  required: boolean;
  input: "text" | "number" | "date" | "textarea" | "checkbox" | "select";
  error?: string;
};

type AdminResourceFormFieldsetDefinition = {
  legend: string;
  fields: Omit<AdminResourceFormField, "error">[];
};

export type AdminResourceFormFieldset = {
  legend: string;
  fields: AdminResourceFormField[];
};

export type AdminResourceFormPresentation = {
  title: string;
  submitLabel: string;
  disabled: boolean;
  fieldsets: AdminResourceFormFieldset[];
  outOfScopeActions: [];
};

const FIELDSETS: AdminResourceFormFieldsetDefinition[] = [
  {
    legend: "Datos básicos",
    fields: [
      { name: "nombre", label: "Nombre", required: true, input: "text" },
      { name: "tipo", label: "Tipo", required: true, input: "select" },
      { name: "direccion", label: "Dirección", required: true, input: "text" },
      { name: "barrio", label: "Barrio", required: false, input: "text" },
      { name: "lat", label: "Latitud", required: true, input: "number" },
      { name: "lng", label: "Longitud", required: true, input: "number" },
      { name: "poblacion", label: "Población", required: true, input: "text" }
    ]
  },
  {
    legend: "Contacto y fuente",
    fields: [
      { name: "telefono", label: "Teléfono", required: false, input: "text" },
      { name: "horario", label: "Horario", required: false, input: "textarea" },
      { name: "fuente", label: "Fuente", required: true, input: "text" },
      { name: "ultimaActualizacion", label: "Última actualización", required: true, input: "date" },
      { name: "observaciones", label: "Observaciones", required: false, input: "textarea" },
      { name: "esCentroReferencia", label: "Centro de referencia", required: false, input: "checkbox" }
    ]
  },
  {
    legend: "Mantenimiento",
    fields: [
      { name: "maintenance.reviewBy", label: "Revisar antes de", required: true, input: "date" }
    ]
  }
];

type GetAdminResourceFormPresentationOptions = {
  mode: AdminResourceFormMode;
  isSubmitting: boolean;
  fieldErrors: AdminResourceFieldErrors;
};

export function getAdminResourceFormPresentation({
  mode,
  isSubmitting,
  fieldErrors
}: GetAdminResourceFormPresentationOptions): AdminResourceFormPresentation {
  return {
    title: mode === "create" ? "Crear recurso" : "Editar recurso",
    submitLabel: isSubmitting ? "Guardando..." : mode === "create" ? "Crear recurso" : "Guardar cambios",
    disabled: isSubmitting,
    fieldsets: FIELDSETS.map((fieldset) => ({
      legend: fieldset.legend,
      fields: fieldset.fields.map((field) => ({ ...field, error: fieldErrors[field.name] }))
    })),
    outOfScopeActions: []
  };
}
