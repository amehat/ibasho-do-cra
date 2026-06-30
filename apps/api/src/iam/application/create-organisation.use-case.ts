import { Inject, Injectable } from "@nestjs/common";
import { Organisation } from "../domain/organisation";
import { ORGANISATION_REPOSITORY, type OrganisationRepository } from "../domain/ports/organisation-repository.port";
import { ID_GENERATOR, type IdGenerator } from "../domain/ports/id-generator.port";

@Injectable()
export class CreateOrganisation {
  constructor(
    @Inject(ORGANISATION_REPOSITORY) private readonly orgs: OrganisationRepository,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator
  ) {}

  async execute(userId: string, nom: string, type: string): Promise<{ organisationId: string }> {
    const { organisation, ownerMembership } = Organisation.create(
      this.ids.newId(),
      nom,
      type,
      this.ids.newId(),
      userId
    );
    await this.orgs.saveNewWithOwner(organisation, ownerMembership);
    return { organisationId: organisation.id };
  }
}
