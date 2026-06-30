import { describe, it, expect } from "vitest";
import { statusPreset } from "../app/components/atoms/status-presets";

describe("statusPreset (AD-20 : jamais la couleur seule)", () => {
  it("chaque statut porte un libellé ET une icône (pas que la couleur)", () => {
    for (const code of ["brouillon", "soumis", "refuse", "valide", "facture", "regle", "actif", "inactif"]) {
      const p = statusPreset(code);
      expect(p.label.length).toBeGreaterThan(0);
      expect(p.icon.length).toBeGreaterThan(0);
      expect(p.variant.length).toBeGreaterThan(0);
    }
  });
  it("statut inconnu -> repli sûr avec libellé + icône", () => {
    const p = statusPreset("xyz");
    expect(p.label).toBe("xyz");
    expect(p.icon).toBeTruthy();
  });
});
