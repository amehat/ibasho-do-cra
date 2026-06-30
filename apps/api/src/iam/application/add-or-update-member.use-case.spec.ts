import { describe, it, expect } from "vitest";
import { AddOrUpdateMember } from "./add-or-update-member.use-case";
import { UserNotFoundError } from "./errors";
import { InvalidRolesError } from "../domain/value-objects/role-policy";
import { Membership } from "../domain/membership";
import { Organisation } from "../domain/organisation";
import { OrganisationType } from "../domain/value-objects/organisation-type";
import { User } from "../domain/user";
import { Email } from "../domain/value-objects/email";
import { PasswordHash } from "../domain/value-objects/password-hash";
import { Role } from "../domain/role";
import type { MembershipPolicy } from "./ports/membership-policy.port";
import type { OrganisationRepository } from "../domain/ports/organisation-repository.port";
import type { UserRepository } from "../domain/ports/user-repository.port";
import type { MembershipRepository } from "../domain/ports/membership-repository.port";

const policy: MembershipPolicy = { async requireActiveOwner() { return Membership.createOwner("a", "o1", "actor"); } };
const org = new Organisation("o1", "Acme", OrganisationType.create("prestataire"));
const orgs: OrganisationRepository = { async saveNewWithOwner() {}, async findByIds() { return [org]; } };
const member = User.register("u2", Email.create("bob@example.com"), PasswordHash.fromHashed("h"));
const users: UserRepository = {
  async findByEmail(e) { return e.value === "bob@example.com" ? member : null; },
  async findById() { return null; }, async findByIds() { return []; }, async save() {}
};
function memRepo(existing: Membership | null): { repo: MembershipRepository; saved: () => Membership | null } {
  let s: Membership | null = null;
  const repo: MembershipRepository = {
    async findActiveByUser() { return []; }, async findActiveOwnersByOrg() { return []; },
    async findByOrgAndUser() { return existing; }, async findByOrg() { return []; },
    async save(m) { s = m; }
  };
  return { repo, saved: () => s };
}
const ids = { newId: () => "m-new" };

describe("AddOrUpdateMember", () => {
  it("ajoute un membre existant avec rôles cumulés", async () => {
    const { repo, saved } = memRepo(null);
    const r = await new AddOrUpdateMember(policy, orgs, users, repo, ids).execute("actor", "o1", "bob@example.com", [Role.PRESTATAIRE]);
    expect(r.userId).toBe("u2");
    expect(saved()!.isActive).toBe(true);
    expect(saved()!.roles).toEqual([Role.PRESTATAIRE]);
  });
  it("réactive une membership existante (idempotent, AC5)", async () => {
    const existing = new Membership("m-old", "o1", "u2", [Role.PRESTATAIRE], false);
    const { repo, saved } = memRepo(existing);
    await new AddOrUpdateMember(policy, orgs, users, repo, ids).execute("actor", "o1", "bob@example.com", [Role.PRESTATAIRE]);
    expect(saved()!.id).toBe("m-old"); // pas de doublon
    expect(saved()!.isActive).toBe(true);
  });
  it("email inconnu -> UserNotFoundError", async () => {
    const { repo } = memRepo(null);
    await expect(new AddOrUpdateMember(policy, orgs, users, repo, ids).execute("actor", "o1", "ghost@example.com", [Role.PRESTATAIRE]))
      .rejects.toBeInstanceOf(UserNotFoundError);
  });
  it("rôle invalide pour le type d'orga -> InvalidRolesError", async () => {
    const { repo } = memRepo(null);
    await expect(new AddOrUpdateMember(policy, orgs, users, repo, ids).execute("actor", "o1", "bob@example.com", [Role.VALIDEUR]))
      .rejects.toBeInstanceOf(InvalidRolesError);
  });
});
