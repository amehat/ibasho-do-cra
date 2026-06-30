import { Inject, Injectable } from "@nestjs/common";
import { Email } from "../domain/value-objects/email";
import { Membership } from "../domain/membership";
import { Role } from "../domain/role";
import { assertRolesValidForOrgType } from "../domain/value-objects/role-policy";
import { assertNotLastActiveOwner } from "../domain/membership-rules";
import { ORGANISATION_REPOSITORY, type OrganisationRepository } from "../domain/ports/organisation-repository.port";
import { MEMBERSHIP_REPOSITORY, type MembershipRepository } from "../domain/ports/membership-repository.port";
import { USER_REPOSITORY, type UserRepository } from "../domain/ports/user-repository.port";
import { ID_GENERATOR, type IdGenerator } from "../domain/ports/id-generator.port";
import { MEMBERSHIP_POLICY, type MembershipPolicy } from "./ports/membership-policy.port";
import { OrganisationNotFoundError, UserNotFoundError } from "./errors";

@Injectable()
export class AddOrUpdateMember {
  constructor(
    @Inject(MEMBERSHIP_POLICY) private readonly policy: MembershipPolicy,
    @Inject(ORGANISATION_REPOSITORY) private readonly orgs: OrganisationRepository,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(MEMBERSHIP_REPOSITORY) private readonly memberships: MembershipRepository,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator
  ) {}

  async execute(actorId: string, orgId: string, email: string, roles: Role[]): Promise<{ userId: string; roles: Role[] }> {
    await this.policy.requireActiveOwner(actorId, orgId);
    const [org] = await this.orgs.findByIds([orgId]);
    if (!org) throw new OrganisationNotFoundError();
    assertRolesValidForOrgType(roles, org.type.value);

    const user = await this.users.findByEmail(Email.create(email));
    if (!user) throw new UserNotFoundError();

    const existing = await this.memberships.findByOrgAndUser(orgId, user.id);
    if (existing) {
      // Chemin gardé/atomique : empêche de retirer owner au dernier propriétaire actif (AD-23) via le POST.
      await this.memberships.withOrgOwnerGuard(orgId, user.id, ({ target, activeOwnerCount }) => {
        if (!target) return null;
        if (target.isActive && target.hasRole(Role.OWNER) && !roles.includes(Role.OWNER)) {
          assertNotLastActiveOwner(true, activeOwnerCount);
        }
        target.reactivate(roles); // réactive (ou met à jour) sans doublon, rôles dédoublonnés
        return target;
      });
    } else {
      // Nouveau membre : aucun retrait de propriétaire possible. (Course d'insertion -> 409 mappé au contrôleur.)
      await this.memberships.save(new Membership(this.ids.newId(), orgId, user.id, roles, true));
    }
    return { userId: user.id, roles: [...new Set(roles)] };
  }
}
