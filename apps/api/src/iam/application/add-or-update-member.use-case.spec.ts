import { describe, it, expect } from "vitest";
import { AddOrUpdateMember } from "./add-or-update-member.use-case";
import { UserNotFoundError } from "./errors";
import { InvalidRolesError } from "../domain/value-objects/role-policy";
import { LastOwnerError } from "../domain/membership-rules";
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

// Fake repo : findByOrgAndUser fournit l'existant ; withOrgOwnerGuard invoque la décision avec un ctx contrôlé.
function memRepo(existing: Membership | null, guardTarget: Membership | null, ownerCount = 0) {
  let saved: Membership | null = null;
  const repo = {
    async findActiveByUser() { return []; },
    async findActiveOwnersByOrg() { return []; },
    async findByOrgAndUser() { return existing; },
    async findByOrg() { return []; },
    async save(m: Membership) { saved = m; },
    async withOrgOwnerGuard(_o: string, _u: string, decide: (c: { target: Membership | null; activeOwnerCount: number }) => Membership | null) {
      const r = decide({ target: guardTarget, activeOwnerCount: ownerCount });
      if (r) saved = r;
    }
  } as MembershipRepository;
  return { repo, saved: () => saved };
}
const ids = { newId: () => "m-new" };

describe("AddOrUpdateMember", () => {
  it("ajoute un nouveau membre (insert)", async () => {
    const { repo, saved } = memRepo(null, null);
    const r = await new AddOrUpdateMember(policy, orgs, users, repo, ids).execute("actor", "o1", "bob@example.com", [Role.PRESTATAIRE]);
    expect(r.userId).toBe("u2");
    expect(saved()!.id).toBe("m-new");
    expect(saved()!.isActive).toBe(true);
  });
  it("réactive une membership existante (idempotent, AC5)", async () => {
    const existing = new Membership("m-old", "o1", "u2", [Role.PRESTATAIRE], false);
    const { repo, saved } = memRepo(existing, existing, 1);
    await new AddOrUpdateMember(policy, orgs, users, repo, ids).execute("actor", "o1", "bob@example.com", [Role.PRESTATAIRE]);
    expect(saved()!.id).toBe("m-old");
    expect(saved()!.isActive).toBe(true);
  });
  it("refuse de retirer owner au dernier propriétaire via le POST (AD-23)", async () => {
    const lastOwner = new Membership("m-own", "o1", "u2", [Role.OWNER], true);
    const { repo } = memRepo(lastOwner, lastOwner, 1);
    await expect(new AddOrUpdateMember(policy, orgs, users, repo, ids).execute("actor", "o1", "bob@example.com", [Role.PRESTATAIRE]))
      .rejects.toBeInstanceOf(LastOwnerError);
  });
  it("email inconnu -> UserNotFoundError", async () => {
    const { repo } = memRepo(null, null);
    await expect(new AddOrUpdateMember(policy, orgs, users, repo, ids).execute("actor", "o1", "ghost@example.com", [Role.PRESTATAIRE]))
      .rejects.toBeInstanceOf(UserNotFoundError);
  });
  it("rôle invalide pour le type d'orga -> InvalidRolesError", async () => {
    const { repo } = memRepo(null, null);
    await expect(new AddOrUpdateMember(policy, orgs, users, repo, ids).execute("actor", "o1", "bob@example.com", [Role.VALIDEUR]))
      .rejects.toBeInstanceOf(InvalidRolesError);
  });
});
