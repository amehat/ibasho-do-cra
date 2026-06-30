import { Inject, Injectable } from "@nestjs/common";
import { MEMBERSHIP_REPOSITORY, type MembershipRepository } from "../domain/ports/membership-repository.port";
import { ORGANISATION_REPOSITORY, type OrganisationRepository } from "../domain/ports/organisation-repository.port";
import type { OrganisationTypeValue } from "../domain/value-objects/organisation-type";

export interface OrganisationView {
  id: string;
  nom: string;
  type: OrganisationTypeValue;
}

@Injectable()
export class ListMyOrganisations {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY) private readonly memberships: MembershipRepository,
    @Inject(ORGANISATION_REPOSITORY) private readonly orgs: OrganisationRepository
  ) {}

  // Cloisonnement (AD-10) : filtre par le userId du contexte d'acteur, jamais par un id de la requête.
  async execute(userId: string): Promise<OrganisationView[]> {
    const active = await this.memberships.findActiveByUser(userId);
    const orgs = await this.orgs.findByIds(active.map((m) => m.orgId));
    return orgs.map((o) => ({ id: o.id, nom: o.nom, type: o.type.value }));
  }
}
