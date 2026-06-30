import { Inject, Injectable } from "@nestjs/common";
import { Role } from "../domain/role";
import { assertRolesValidForOrgType } from "../domain/value-objects/role-policy";
import { assertNotLastActiveOwner } from "../domain/membership-rules";
import { ORGANISATION_REPOSITORY, type OrganisationRepository } from "../domain/ports/organisation-repository.port";
import { MEMBERSHIP_REPOSITORY, type MembershipRepository } from "../domain/ports/membership-repository.port";
import { MEMBERSHIP_POLICY, type MembershipPolicy } from "./ports/membership-policy.port";
import { MemberNotFoundError, OrganisationNotFoundError } from "./errors";

@Injectable()
export class ChangeMemberRoles {
  constructor(
    @Inject(MEMBERSHIP_POLICY) private readonly policy: MembershipPolicy,
    @Inject(ORGANISATION_REPOSITORY) private readonly orgs: OrganisationRepository,
    @Inject(MEMBERSHIP_REPOSITORY) private readonly memberships: MembershipRepository
  ) {}

  async execute(actorId: string, orgId: string, memberUserId: string, roles: Role[]): Promise<void> {
    await this.policy.requireActiveOwner(actorId, orgId);
    const [org] = await this.orgs.findByIds([orgId]);
    if (!org) throw new OrganisationNotFoundError();
    assertRolesValidForOrgType(roles, org.type.value);

    const membership = await this.memberships.findByOrgAndUser(orgId, memberUserId);
    if (!membership || !membership.isActive) throw new MemberNotFoundError();

    // Refuse de retirer owner au dernier propriétaire actif (AD-23).
    if (membership.hasRole(Role.OWNER) && !roles.includes(Role.OWNER)) {
      const owners = await this.memberships.findActiveOwnersByOrg(orgId);
      assertNotLastActiveOwner(true, owners.length);
    }
    membership.setRoles(roles);
    await this.memberships.save(membership);
  }
}
