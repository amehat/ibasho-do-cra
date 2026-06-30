import { describe, it, expect } from "vitest";
import { DeactivateMember } from "./deactivate-member.use-case";
import { LastOwnerError } from "../domain/membership-rules";
import { MemberNotFoundError } from "./errors";
import { Membership } from "../domain/membership";
import { Role } from "../domain/role";
import type { MembershipRepository } from "../domain/ports/membership-repository.port";
import type { MembershipPolicy } from "./ports/membership-policy.port";

const policy: MembershipPolicy = { async requireActiveOwner() { return Membership.createOwner("a", "o1", "actor"); } };

function repo(target: Membership | null, owners: Membership[]): MembershipRepository {
  return {
    async findActiveByUser() { return []; },
    async findActiveOwnersByOrg() { return owners; },
    async findByOrgAndUser() { return target; },
    async findByOrg() { return []; },
    async save() {}
  };
}

describe("DeactivateMember", () => {
  it("refuse de désactiver le dernier propriétaire actif (AD-23)", async () => {
    const owner = new Membership("m1", "o1", "u1", [Role.OWNER], true);
    const uc = new DeactivateMember(policy, repo(owner, [owner]));
    await expect(uc.execute("actor", "o1", "u1")).rejects.toBeInstanceOf(LastOwnerError);
  });
  it("désactive un membre non-propriétaire", async () => {
    const m = new Membership("m2", "o1", "u2", [Role.PRESTATAIRE], true);
    let saved: Membership | null = null;
    const r = repo(m, []); r.save = async (x) => { saved = x; };
    await new DeactivateMember(policy, r).execute("actor", "o1", "u2");
    expect(saved!.isActive).toBe(false);
  });
  it("membre inexistant -> MemberNotFoundError", async () => {
    await expect(new DeactivateMember(policy, repo(null, [])).execute("actor", "o1", "x"))
      .rejects.toBeInstanceOf(MemberNotFoundError);
  });
});
