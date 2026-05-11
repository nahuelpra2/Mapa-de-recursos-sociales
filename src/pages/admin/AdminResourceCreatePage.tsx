import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AdminResourceForm } from "../../components/admin/AdminResourceForm";
import { adminResourceRepository } from "../../data/adminResourceRepository";
import { createAdminResourceDraft, submitAdminResourceDraft, type AdminResourceFieldErrors, type AdminResourceSubmitStatus } from "../../hooks/useAdminResources";
import { resolveAdminResourceCreatePresentation } from "./adminResourceFormPresentation";

export function AdminResourceCreatePage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(createAdminResourceDraft);
  const [submitStatus, setSubmitStatus] = useState<AdminResourceSubmitStatus>("idle");
  const [fieldErrors, setFieldErrors] = useState<AdminResourceFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const presentation = resolveAdminResourceCreatePresentation({ submitStatus });

  async function handleSubmit() {
    setSubmitStatus("submitting");
    const result = await submitAdminResourceDraft({ mode: "create", draft, repository: adminResourceRepository });
    setSubmitStatus(result.status);
    setFieldErrors(result.fieldErrors);
    setFormError(result.formError);
    if (result.redirectTo) navigate(result.redirectTo);
  }

  return (
    <section className="space-y-6">
      <div>
        <Link to={presentation.backHref} className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">
          Volver a recursos
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-slate-50">{presentation.title}</h1>
        <p className="mt-2 text-sm text-slate-300">{presentation.message}</p>
        {presentation.successMessage ? <p className="mt-3 text-sm text-emerald-200">{presentation.successMessage}</p> : null}
      </div>
      <AdminResourceForm mode="create" draft={draft} fieldErrors={fieldErrors} formError={formError} isSubmitting={submitStatus === "submitting"} onChange={setDraft} onSubmit={handleSubmit} />
    </section>
  );
}
