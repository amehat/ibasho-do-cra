import { describe, it, expect } from "vitest";
import { CreateOrganisation } from "./create-organisation.use-case";
import type { OrganisationRepository } from "../domain/ports/organisation-repository.port";
import type { Organisation } from "../domain/organisation";
import type { Membership } from "../domain/membership";

describe("CreateOrganisation", () => {
  it("crée l'organisation avec le créateur comme propriétaire actif (atomique)", async () => {
    let savedOrg: Organisation | null = null;
    let savedOwner: Membership | null = null;
    const orgs: OrganisationRepository = {
      async saveNewWithOwner(o, owner) { savedOrg = o; savedOwner = owner; },
      async findByIds() { return []; }
    };
    let n = 0;
    const uc = new CreateOrganisation(orgs, { newId: () => `id-${++n}` });
    const { organisationId } = await uc.execute("user-1", "Acme", "cliente");
    expect(organisationId).toBe(savedOrg!.id);
    expect(savedOwner!.userId).toBe("user-1");
    expect(savedOwner!.isOwner()).toBe(true);
    expect(savedOwner!.isActive).toBe(true);
    expect(savedOwner!.orgId).toBe(savedOrg!.id);
  });
});
