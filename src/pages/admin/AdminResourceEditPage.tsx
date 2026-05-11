import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { AdminResourceForm } from "../../components/admin/AdminResourceForm";
import { adminResourceRepository } from "../../data/adminResourceRepository";
import type { AdminResourceDraft } from "../../data/adminResourceSchema";
import {
  resolveAdminResourceEditLoad,
  resolveAdminResourceEditLoadError,
  submitAdminResourceDraft,
  type AdminResourceEditLoadState,
  type AdminResourceFieldErrors,
  type AdminResourceSubmitStatus
} from "../../hooks/useAdminResources";
import { resolveAdminResourceEditPresentation } from "./adminResourceFormPresentation";

export function AdminResourceEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [loadState, setLoadState] = useState<AdminResourceEditLoadState>({ status: "loading", draft: null, error: null });
  const [submitStatus, setSubmitStatus] = useState<AdminResourceSubmitStatus>("idle");
  const [fieldErrors, setFieldErrors] = useState<AdminResourceFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const presentation = resolveAdminResourceEditPresentation({ loadStatus: loadState.status, submitStatus });

  useEffect(() => {
    let active = true;
    setLoadState({ status: "loading", draft: null, error: null });
    adminResourceRepository
      .getById(id)
      .then((resource) => {
        if (active) setLoadState(resolveAdminResourceEditLoad(resource));
      })
      .catch(() => {
        if (active) setLoadState(resolveAdminResourceEditLoadError());
      });

    return () => {
      active = false;
    };
  }, [id]);

  async function handleSubmit() {
    if (!loadState.draft) return;
    setSubmitStatus("submitting");
    const result = await submitAdminResourceDraft({ mode: "edit", id, draft: loadState.draft, repository: adminResourceRepository });
    setSubmitStatus(result.status);
    setFieldErrors(result.fieldErrors);
    setFormError(result.formError);
    if (result.redirectTo) navigate(result.redirectTo);
  }

  function handleChange(draft: AdminResourceDraft) {
    setLoadState({ status: "success", draft, error: null });
  }

  return (
    <section className="space-y-6">
      <div>
        <Link to={presentation.backHref} className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">
          Volver a recursos
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-slate-50">{presentation.title}</h1>
        <p className="mt-2 text-sm text-slate-300">{loadState.error ?? presentation.message}</p>
        {presentation.successMessage ? <p className="mt-3 text-sm text-emerald-200">{presentation.successMessage}</p> : null}
      </div>
      {presentation.canShowForm && loadState.draft ? (
        <AdminResourceForm mode="edit" draft={loadState.draft} fieldErrors={fieldErrors} formError={formError} isSubmitting={submitStatus === "submitting"} onChange={handleChange} onSubmit={handleSubmit} />
      ) : null}
    </section>
  );
}
