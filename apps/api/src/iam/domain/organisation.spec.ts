import { describe, it, expect } from "vitest";
import { Organisation, InvalidOrganisationNameError } from "./organisation";
import { InvalidOrganisationTypeError } from "./value-objects/organisation-type";

describe("Organisation.create", () => {
  it("produit l'organisation + une membership propriétaire ACTIVE du créateur (AD-23)", () => {
    const { organisation, ownerMembership } = Organisation.create("o1", "  Acme  ", "prestataire", "m1", "u1");
    expect(organisation.nom).toBe("Acme");
    expect(organisation.type.value).toBe("prestataire");
    expect(ownerMembership.orgId).toBe("o1");
    expect(ownerMembership.userId).toBe("u1");
    expect(ownerMembership.isOwner()).toBe(true);
    expect(ownerMembership.isActive).toBe(true);
  });
  it("refuse un nom vide", () => {
    expect(() => Organisation.create("o1", "   ", "cliente", "m1", "u1")).toThrow(InvalidOrganisationNameError);
  });
  it("refuse un type invalide", () => {
    expect(() => Organisation.create("o1", "Acme", "xxx", "m1", "u1")).toThrow(InvalidOrganisationTypeError);
  });
});
