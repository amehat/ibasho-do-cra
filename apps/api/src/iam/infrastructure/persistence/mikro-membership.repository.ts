import { Injectable } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/mariadb";
import { Membership } from "../../domain/membership";
import { Role } from "../../domain/role";
import type { MembershipRepository } from "../../domain/ports/membership-repository.port";
import { MembershipOrmEntity } from "./membership.orm-entity";

@Injectable()
export class MikroMembershipRepository implements MembershipRepository {
  constructor(private readonly em: EntityManager) {}

  private toDomain(r: MembershipOrmEntity): Membership {
    return new Membership(r.id, r.orgId, r.userId, r.roles, r.isActive);
  }

  async findActiveByUser(userId: string): Promise<Membership[]> {
    const rows = await this.em.fork().find(MembershipOrmEntity, { userId, isActive: true });
    return rows.map((r) => this.toDomain(r));
  }

  async findActiveOwnersByOrg(orgId: string): Promise<Membership[]> {
    const rows = await this.em.fork().find(MembershipOrmEntity, { orgId, isActive: true });
    return rows.filter((r) => r.roles.includes(Role.OWNER)).map((r) => this.toDomain(r));
  }
}
