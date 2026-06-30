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
    // Décompte + désactivation atomiques (verrou) -> pas de course sur le dernier propriétaire (AD-23).
    await this.memberships.withOrgOwnerGuard(orgId, memberUserId, ({ target, activeOwnerCount }) => {
      if (!target || !target.isActive) throw new MemberNotFoundError();
      if (target.hasRole(Role.OWNER)) assertNotLastActiveOwner(true, activeOwnerCount);
      target.deactivate(); // AD-11 : jamais de suppression
      return target;
    });
  }
}
