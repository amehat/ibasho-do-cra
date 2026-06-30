import { Injectable } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/mariadb";
import { Organisation } from "../../domain/organisation";
import { Membership } from "../../domain/membership";
import { OrganisationType } from "../../domain/value-objects/organisation-type";
import type { OrganisationRepository } from "../../domain/ports/organisation-repository.port";
import { OrganisationOrmEntity } from "./organisation.orm-entity";
import { MembershipOrmEntity } from "./membership.orm-entity";

@Injectable()
export class MikroOrganisationRepository implements OrganisationRepository {
  constructor(private readonly em: EntityManager) {}

  // Org + membership propriétaire dans UNE transaction -> jamais d'organisation sans propriétaire (AD-23).
  async saveNewWithOwner(organisation: Organisation, owner: Membership): Promise<void> {
    await this.em.fork().transactional(async (em) => {
      const org = new OrganisationOrmEntity();
      org.id = organisation.id;
      org.nom = organisation.nom;
      org.type = organisation.type.value;
      const m = new MembershipOrmEntity();
      m.id = owner.id;
      m.orgId = owner.orgId;
      m.userId = owner.userId;
      m.roles = owner.roles;
      m.isActive = owner.isActive;
      em.persist(org);
      em.persist(m);
    });
  }

  async findByIds(ids: string[]): Promise<Organisation[]> {
    if (ids.length === 0) return [];
    const rows = await this.em.fork().find(OrganisationOrmEntity, { id: { $in: ids } });
    return rows.map((r) => new Organisation(r.id, r.nom, OrganisationType.create(r.type)));
  }
}
