import { describe, it, expect } from "vitest";
import { DeactivateMember } from "./deactivate-member.use-case";
import { LastOwnerError } from "../domain/membership-rules";
import { MemberNotFoundError } from "./errors";
import { Membership } from "../domain/membership";
import { Role } from "../domain/role";
import type { MembershipRepository } from "../domain/ports/membership-repository.port";
import type { MembershipPolicy } from "./ports/membership-policy.port";

const policy: MembershipPolicy = { async requireActiveOwner() { return Membership.createOwner("a", "o1", "actor"); } };

// Fake repo : withOrgOwnerGuard invoque la décision avec un ctx contrôlé (target + décompte).
function guardRepo(target: Membership | null, activeOwnerCount: number) {
  let saved: Membership | null = null;
  const repo = {
    async findActiveByUser() { return []; },
    async findActiveOwnersByOrg() { return []; },
    async findByOrgAndUser() { return target; },
    async findByOrg() { return []; },
    async save() {},
    async withOrgOwnerGuard(_o: string, _u: string, decide: (c: { target: Membership | null; activeOwnerCount: number }) => Membership | null) {
      const r = decide({ target, activeOwnerCount });
      if (r) saved = r;
    }
  } as MembershipRepository;
  return { repo, saved: () => saved };
}

describe("DeactivateMember", () => {
  it("refuse de désactiver le dernier propriétaire actif (AD-23)", async () => {
    const owner = new Membership("m1", "o1", "u1", [Role.OWNER], true);
    await expect(new DeactivateMember(policy, guardRepo(owner, 1).repo).execute("actor", "o1", "u1"))
      .rejects.toBeInstanceOf(LastOwnerError);
  });
  it("désactive un membre non-propriétaire", async () => {
    const m = new Membership("m2", "o1", "u2", [Role.PRESTATAIRE], true);
    const g = guardRepo(m, 0);
    await new DeactivateMember(policy, g.repo).execute("actor", "o1", "u2");
    expect(g.saved()!.isActive).toBe(false);
  });
  it("membre inexistant -> MemberNotFoundError", async () => {
    await expect(new DeactivateMember(policy, guardRepo(null, 0).repo).execute("actor", "o1", "x"))
      .rejects.toBeInstanceOf(MemberNotFoundError);
  });
});
