import { describe, it, expect } from "vitest";
import { ListMyOrganisations } from "./list-my-organisations.use-case";
import { Membership } from "../domain/membership";
import { Organisation } from "../domain/organisation";
import { OrganisationType } from "../domain/value-objects/organisation-type";
import type { MembershipRepository } from "../domain/ports/membership-repository.port";
import type { OrganisationRepository } from "../domain/ports/organisation-repository.port";

describe("ListMyOrganisations", () => {
  it("ne renvoie que les organisations de l'utilisateur (appartenances actives)", async () => {
    const memberships: MembershipRepository = {
      async findActiveByUser(userId) {
        return userId === "u1" ? [Membership.createOwner("m1", "o1", "u1")] : [];
      },
      async findActiveOwnersByOrg() { return []; }
    };
    const orgs: OrganisationRepository = {
      async saveNewWithOwner() {},
      async findByIds(ids) {
        return ids.includes("o1") ? [new Organisation("o1", "Acme", OrganisationType.create("prestataire"))] : [];
      }
    };
    const uc = new ListMyOrganisations(memberships, orgs);
    expect(await uc.execute("u1")).toEqual([{ id: "o1", nom: "Acme", type: "prestataire" }]);
    expect(await uc.execute("u2")).toEqual([]);
  });
});
