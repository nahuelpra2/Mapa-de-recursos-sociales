import { describe, expect, it } from "vitest";
import { createResource } from "../test/fixtures/resources";
import { buildResourceClipboardText } from "./clipboard";

describe("resource clipboard text", () => {
  it("includes the public resource details without legacy access flags", () => {
    const text = buildResourceClipboardText(
      createResource({
        nombre: "Centro Test",
        tipo: "Centro de atención",
        direccion: "Calle Test 123",
        telefono: "011 1234-5678",
        horario: "24 horas",
        poblacion: ["Personas adultas"],
        observaciones: "Ingresar por guardia"
      })
    );

    expect(text).toContain("Centro: Centro Test");
    expect(text).toContain("Poblacion atendida: Personas adultas");
    expect(text).toContain("Observaciones: Ingresar por guardia");
    expect(text).not.toContain("Condiciones de acceso");
    expect(text).not.toContain("derivacion");
    expect(text.toLowerCase()).not.toContain("acceso directo");
  });

  it("omits observations when the resource has none", () => {
    const text = buildResourceClipboardText(
      createResource({
        observaciones: undefined
      })
    );

    expect(text).toContain("Centro: Recurso fixture");
    expect(text).not.toContain("Observaciones:");
  });

  it("still builds clipboard text for transitional resources without modalidad", () => {
    const text = buildResourceClipboardText(
      createResource({
        modalidad: undefined,
        observaciones: undefined
      })
    );

    expect(text).toContain("Centro: Recurso fixture");
    expect(text).toContain("Tipo: Centro de atención");
    expect(text).not.toContain("Modalidad:");
  });
});
