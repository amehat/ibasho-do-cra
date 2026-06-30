import { Inject, Injectable } from "@nestjs/common";
import { Role } from "../domain/role";
import { assertNotLastActiveOwner } from "../domain/membership-rules";
import { MEMBERSHIP_REPOSITORY, type MembershipRepository } from "../domain/ports/membership-repository.port";
import { MEMBERSHIP_POLICY, type MembershipPolicy } from "./ports/membership-policy.port";
import { MemberNotFoundError } from "./errors";

@Injectable()
export class DeactivateMember {
  constructor(
    @Inject(MEMBERSHIP_POLICY) private readonly policy: MembershipPolicy,
    @Inject(MEMBERSHIP_REPOSITORY) private readonly memberships: MembershipRepository
  ) {}

  async execute(actorId: string, orgId: string, memberUserId: string): Promise<void> {
    await this.policy.requireActiveOwner(actorId, orgId);
    const membership = await this.memberships.findByOrgAndUser(orgId, memberUserId);
    if (!membership || !membership.isActive) throw new MemberNotFoundError();

    // Refuse la désactivation du dernier propriétaire actif (AD-23).
    if (membership.hasRole(Role.OWNER)) {
      const owners = await this.memberships.findActiveOwnersByOrg(orgId);
      assertNotLastActiveOwner(true, owners.length);
    }
    membership.deactivate(); // AD-11 : jamais de suppression
    await this.memberships.save(membership);
  }
}
