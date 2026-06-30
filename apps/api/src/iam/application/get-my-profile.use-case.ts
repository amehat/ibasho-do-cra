import { Inject, Injectable } from "@nestjs/common";
import { Role } from "../domain/role";
import { MEMBERSHIP_REPOSITORY, type MembershipRepository } from "../domain/ports/membership-repository.port";
import { ORGANISATION_REPOSITORY, type OrganisationRepository } from "../domain/ports/organisation-repository.port";
import { USER_REPOSITORY, type UserRepository } from "../domain/ports/user-repository.port";

export interface MyOrganisationView {
  id: string;
  nom: string;
  roles: Role[];
}
export interface MyProfileView {
  userId: string;
  email: string | null;
  organisations: MyOrganisationView[];
}

// Agrège l'utilisateur courant + ses organisations/rôles ACTIFS (résolution live des rôles, AD-14).
@Injectable()
export class GetMyProfile {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY) private readonly memberships: MembershipRepository,
    @Inject(ORGANISATION_REPOSITORY) private readonly orgs: OrganisationRepository,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository
  ) {}

  async execute(userId: string): Promise<MyProfileView> {
    const [me] = await this.users.findByIds([userId]);
    const active = await this.memberships.findActiveByUser(userId);
    const orgs = await this.orgs.findByIds(active.map((m) => m.orgId));
    const nomById = new Map(orgs.map((o) => [o.id, o.nom]));
    return {
      userId,
      email: me ? me.email.value : null,
      organisations: active
        .filter((m) => nomById.has(m.orgId))
        .map((m) => ({ id: m.orgId, nom: nomById.get(m.orgId)!, roles: m.roles }))
    };
  }
}
