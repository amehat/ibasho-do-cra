import { describe, it, expect } from "vitest";
import { navItemsForRoles } from "../app/utils/nav";

describe("navItemsForRoles (cloisonnement AD-10)", () => {
  it("un propriétaire voit l'entrée Membres", () => {
    const labels = navItemsForRoles(["owner"]).map((i) => i.label);
    expect(labels).toContain("Membres");
  });
  it("un non-propriétaire NE voit PAS l'entrée Membres", () => {
    const labels = navItemsForRoles(["prestataire"]).map((i) => i.label);
    expect(labels).not.toContain("Membres");
  });
  it("les items de base sont toujours présents", () => {
    const labels = navItemsForRoles([]).map((i) => i.label);
    expect(labels).toContain("Tableau de bord");
  });
});
