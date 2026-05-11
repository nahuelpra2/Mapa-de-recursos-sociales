import type { FormEvent } from "react";
import type { AdminResourceDraft } from "../../data/adminResourceSchema";
import type { AdminResourceFieldErrors } from "../../hooks/useAdminResources";
import { getAdminResourceFormPresentation, type AdminResourceFormFieldName, type AdminResourceFormMode } from "./adminResourceFormModel";

type AdminResourceFormProps = {
  mode: AdminResourceFormMode;
  draft: AdminResourceDraft;
  fieldErrors: AdminResourceFieldErrors;
  formError: string | null;
  isSubmitting: boolean;
  onChange: (draft: AdminResourceDraft) => void;
  onSubmit: () => void;
};

function optionalValue(value: string | undefined): string {
  return value ?? "";
}

function populationValue(value: string[]): string {
  return value.join(", ");
}

function splitPopulation(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function setDraftValue(draft: AdminResourceDraft, name: AdminResourceFormFieldName, value: string | boolean): AdminResourceDraft {
  if (name === "lat" || name === "lng") return { ...draft, [name]: Number(value) };
  if (name === "poblacion") return { ...draft, poblacion: splitPopulation(String(value)) };
  if (name === "esCentroReferencia") return { ...draft, esCentroReferencia: Boolean(value) };
  if (name.startsWith("verification.")) {
    const key = name.replace("verification.", "") as keyof AdminResourceDraft["verification"];
    return { ...draft, verification: { ...draft.verification, [key]: String(value) } };
  }
  if (name.startsWith("maintenance.")) {
    const key = name.replace("maintenance.", "") as keyof AdminResourceDraft["maintenance"];
    return { ...draft, maintenance: { ...draft.maintenance, [key]: String(value) } };
  }

  return { ...draft, [name]: String(value) };
}

function getDraftValue(draft: AdminResourceDraft, name: AdminResourceFormFieldName): string | boolean | number {
  if (name === "poblacion") return populationValue(draft.poblacion);
  if (name === "esCentroReferencia") return draft.esCentroReferencia;
  if (name.startsWith("verification.")) {
    const key = name.replace("verification.", "") as keyof AdminResourceDraft["verification"];
    return optionalValue(draft.verification[key]);
  }
  if (name.startsWith("maintenance.")) {
    const key = name.replace("maintenance.", "") as keyof AdminResourceDraft["maintenance"];
    return optionalValue(draft.maintenance[key]);
  }

  return optionalValue(String(draft[name as keyof AdminResourceDraft] ?? ""));
}

export function AdminResourceForm({ mode, draft, fieldErrors, formError, isSubmitting, onChange, onSubmit }: AdminResourceFormProps) {
  const presentation = getAdminResourceFormPresentation({ mode, isSubmitting, fieldErrors });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold text-slate-50">{presentation.title}</h2>
      {formError ? <p className="rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-100">{formError}</p> : null}

      {presentation.fieldsets.map((fieldset) => (
        <fieldset key={fieldset.legend} className="space-y-3 rounded-2xl border border-slate-800 p-4">
          <legend className="px-2 text-sm font-semibold text-emerald-300">{fieldset.legend}</legend>
          <div className="grid gap-4 md:grid-cols-2">
            {fieldset.fields.map((field) => {
              const value = getDraftValue(draft, field.name);
              const commonClass = "rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50";

              return (
                <label key={field.name} className="flex flex-col gap-2 text-sm text-slate-200">
                  <span>{field.required ? `${field.label} *` : field.label}</span>
                  {field.input === "textarea" ? (
                    <textarea className={commonClass} value={String(value)} disabled={presentation.disabled} onChange={(event) => onChange(setDraftValue(draft, field.name, event.target.value))} />
                  ) : field.input === "checkbox" ? (
                    <input className="h-5 w-5" type="checkbox" checked={Boolean(value)} disabled={presentation.disabled} onChange={(event) => onChange(setDraftValue(draft, field.name, event.target.checked))} />
                  ) : field.input === "select" && field.name === "tipo" ? (
                    <select className={commonClass} value={String(value)} disabled={presentation.disabled} onChange={(event) => onChange(setDraftValue(draft, field.name, event.target.value))}>
                      <option>Refugio nocturno</option>
                      <option>Centro diurno</option>
                      <option>Puerta abierta</option>
                      <option>Centro de atención</option>
                      <option>Otro</option>
                    </select>
                  ) : field.input === "select" ? (
                    <select className={commonClass} value={String(value)} disabled={presentation.disabled} onChange={(event) => onChange(setDraftValue(draft, field.name, event.target.value))}>
                      <option value="needs_review">Necesita revisión</option>
                      <option value="verified">Verificado</option>
                    </select>
                  ) : (
                    <input className={commonClass} type={field.input} value={String(value)} disabled={presentation.disabled} onChange={(event) => onChange(setDraftValue(draft, field.name, event.target.value))} />
                  )}
                  {field.error ? <span className="text-xs text-red-200">{field.error}</span> : null}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      <button type="submit" disabled={presentation.disabled} className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">
        {presentation.submitLabel}
      </button>
    </form>
  );
}
