import { Inject, Injectable } from "@nestjs/common";
import { Role } from "../../domain/role";
import { Membership } from "../../domain/membership";
import { MEMBERSHIP_REPOSITORY, type MembershipRepository } from "../../domain/ports/membership-repository.port";
import type { MembershipPolicy } from "../../application/ports/membership-policy.port";
import { ForbiddenMembershipError } from "../../application/errors";

// Résout l'autorisation à la requête (AD-14 : rôles jamais portés par le BFF).
@Injectable()
export class MembershipPolicyAdapter implements MembershipPolicy {
  constructor(@Inject(MEMBERSHIP_REPOSITORY) private readonly memberships: MembershipRepository) {}

  async requireActiveOwner(actorUserId: string, orgId: string): Promise<Membership> {
    const m = await this.memberships.findByOrgAndUser(orgId, actorUserId);
    if (!m || !m.isActive || !m.hasRole(Role.OWNER)) throw new ForbiddenMembershipError();
    return m;
  }
}
