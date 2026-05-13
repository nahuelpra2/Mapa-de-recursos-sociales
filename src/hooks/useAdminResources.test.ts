import { describe, expect, it, vi } from "vitest";
import { createAdminResource, createAdminResourceDraft } from "../test/fixtures/adminResources";
import {
  createAdminResourcesLoadingState,
  resolveAdminResourcesError,
  resolveAdminResourcesSuccess,
  resolveAdminResourceEditLoad,
  submitAdminResourceLifecycleAction,
  shouldShowAdminResourceRows,
  submitAdminResourceDraft
} from "./useAdminResources";

describe("admin resource list state", () => {
  it("starts with a loading state before admin resources resolve", () => {
    expect(createAdminResourcesLoadingState()).toEqual({
      status: "loading",
      resources: [],
      error: null
    });
  });

  it("builds a success state with enough resource data to choose edit", () => {
    const foodBank = createAdminResource({ id: "food-bank", nombre: "Banco de alimentos", tipo: "Alimentos" });
    const shelter = createAdminResource({ id: "shelter", nombre: "Refugio norte", tipo: "Alojamiento" });

    expect(resolveAdminResourcesSuccess([foodBank, shelter])).toEqual({
      status: "success",
      resources: [foodBank, shelter],
      error: null
    });
  });

  it("keeps empty resources explicit instead of pretending the list is still loading", () => {
    expect(resolveAdminResourcesSuccess([])).toEqual({
      status: "empty",
      resources: [],
      error: null
    });
  });

  it("shows a recoverable non-sensitive error and preserves previous resources when reload fails", () => {
    const previous = resolveAdminResourcesSuccess([createAdminResource({ id: "known-resource" })]);

    expect(resolveAdminResourcesError(previous, new Error("JWT claim admin_users missing"))).toEqual({
      ...previous,
      status: "error",
      error: "No se pudieron cargar los recursos. Intentá nuevamente o verificá permisos de administrador."
    });
  });

  it("shows rows only after a successful non-empty load", () => {
    expect(shouldShowAdminResourceRows(createAdminResourcesLoadingState())).toBe(false);
    expect(shouldShowAdminResourceRows(resolveAdminResourcesSuccess([]))).toBe(false);
    expect(shouldShowAdminResourceRows(resolveAdminResourcesSuccess([createAdminResource()]))).toBe(true);
  });
});

describe("admin resource create/edit submit helpers", () => {
  it("prevents persistence and returns field-safe validation errors for invalid create drafts", async () => {
    const create = vi.fn();

    await expect(
      submitAdminResourceDraft({
        mode: "create",
        draft: createAdminResourceDraft({ nombre: "", poblacion: [], maintenance: { reviewBy: "" } }),
        repository: { create, update: vi.fn() }
      })
    ).resolves.toEqual({
      status: "validation-error",
      resource: null,
      redirectTo: null,
      formError: null,
      fieldErrors: expect.objectContaining({
        nombre: "Campo obligatorio.",
        poblacion: "Agregá al menos una población.",
        "maintenance.reviewBy": "Campo obligatorio."
      })
    });
    expect(create).not.toHaveBeenCalled();
  });

  it("persists valid create drafts and returns list navigation feedback", async () => {
    const draft = createAdminResourceDraft({ nombre: "Nuevo comedor" });
    const resource = createAdminResource({ id: "nuevo-comedor", nombre: "Nuevo comedor" });
    const create = vi.fn().mockResolvedValue(resource);

    await expect(submitAdminResourceDraft({ mode: "create", draft, repository: { create, update: vi.fn() } })).resolves.toEqual({
      status: "success",
      resource,
      redirectTo: "/admin/resources",
      formError: null,
      fieldErrors: {}
    });
    expect(create).toHaveBeenCalledWith(draft);
  });

  it("persists valid edit drafts by id and surfaces safe write failures", async () => {
    const draft = createAdminResourceDraft({ nombre: "Recurso actualizado" });
    const resource = createAdminResource({ id: "recurso-1", nombre: "Recurso actualizado" });
    const update = vi.fn().mockResolvedValueOnce(resource).mockRejectedValueOnce(new Error("RLS policy stacktrace"));

    await expect(submitAdminResourceDraft({ mode: "edit", id: "recurso-1", draft, repository: { create: vi.fn(), update } })).resolves.toEqual({
      status: "success",
      resource,
      redirectTo: "/admin/resources",
      formError: null,
      fieldErrors: {}
    });
    expect(update).toHaveBeenCalledWith("recurso-1", draft);

    await expect(submitAdminResourceDraft({ mode: "edit", id: "recurso-1", draft, repository: { create: vi.fn(), update } })).resolves.toEqual({
      status: "error",
      resource: null,
      redirectTo: null,
      formError: "No se pudo guardar el recurso. Intentá nuevamente o verificá permisos de administrador.",
      fieldErrors: {}
    });
  });

  it("maps edit load success to an editable draft and not-found to a safe state", () => {
    const resource = createAdminResource({ id: "editable", nombre: "Editable" });

    expect(resolveAdminResourceEditLoad(resource)).toEqual({
      status: "success",
      draft: expect.objectContaining({ nombre: "Editable", poblacion: resource.poblacion }),
      error: null
    });
    expect(resolveAdminResourceEditLoad(null)).toEqual({
      status: "not-found",
      draft: null,
      error: "No encontramos el recurso solicitado. Puede haber sido modificado o no tenés permisos para verlo."
    });
  });

  it("blocks delete persistence until explicit confirmation is provided", async () => {
    const deleteResource = vi.fn();

    await expect(
      submitAdminResourceLifecycleAction({
        action: "delete",
        id: "resource-1",
        confirmed: false,
        repository: { archive: vi.fn(), delete: deleteResource }
      })
    ).resolves.toEqual({
      status: "confirmation-required",
      resource: null,
      formError: "La eliminación es irreversible. Confirmá para continuar.",
      requiresConfirmation: true
    });
    expect(deleteResource).not.toHaveBeenCalled();
  });

  it("surfaces archive and delete failures through safe non-sensitive lifecycle errors", async () => {
    const archive = vi.fn().mockRejectedValueOnce(new Error("RLS archive trace"));
    const deleteResource = vi.fn().mockRejectedValueOnce(new Error("RLS delete trace"));

    await expect(
      submitAdminResourceLifecycleAction({
        action: "archive",
        id: "resource-1",
        repository: { archive, delete: deleteResource }
      })
    ).resolves.toEqual({
      status: "error",
      resource: null,
      formError: "No se pudo cambiar el estado del recurso. Intentá nuevamente o verificá permisos de administrador.",
      requiresConfirmation: false
    });

    await expect(
      submitAdminResourceLifecycleAction({
        action: "delete",
        id: "resource-1",
        confirmed: true,
        repository: { archive, delete: deleteResource }
      })
    ).resolves.toEqual({
      status: "error",
      resource: null,
      formError: "No se pudo cambiar el estado del recurso. Intentá nuevamente o verificá permisos de administrador.",
      requiresConfirmation: false
    });
  });
});
