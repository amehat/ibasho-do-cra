import { Injectable } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/mariadb";
import { LockMode } from "@mikro-orm/core";
import { Membership } from "../../domain/membership";
import { Role } from "../../domain/role";
import type { MembershipRepository } from "../../domain/ports/membership-repository.port";
import { MembershipOrmEntity } from "./membership.orm-entity";

@Injectable()
export class MikroMembershipRepository implements MembershipRepository {
  constructor(private readonly em: EntityManager) {}

  private toDomain(r: MembershipOrmEntity): Membership {
    const roles = Array.isArray(r.roles) ? r.roles : [];
    return new Membership(r.id, r.orgId, r.userId, roles, r.isActive);
  }

  async findActiveByUser(userId: string): Promise<Membership[]> {
    const rows = await this.em.fork().find(MembershipOrmEntity, { userId, isActive: true });
    return rows.map((r) => this.toDomain(r));
  }

  async findActiveOwnersByOrg(orgId: string): Promise<Membership[]> {
    const rows = await this.em.fork().find(MembershipOrmEntity, { orgId, isActive: true });
    return rows.filter((r) => r.roles.includes(Role.OWNER)).map((r) => this.toDomain(r));
  }
  async findByOrgAndUser(orgId: string, userId: string): Promise<Membership | null> {
    const r = await this.em.fork().findOne(MembershipOrmEntity, { orgId, userId });
    return r ? this.toDomain(r) : null;
  }

  async findByOrg(orgId: string): Promise<Membership[]> {
    const rows = await this.em.fork().find(MembershipOrmEntity, { orgId });
    return rows.map((r) => this.toDomain(r));
  }

  async save(membership: Membership): Promise<void> {
    const em = this.em.fork();
    const row = (await em.findOne(MembershipOrmEntity, { id: membership.id })) ?? new MembershipOrmEntity();
    row.id = membership.id;
    row.orgId = membership.orgId;
    row.userId = membership.userId;
    row.roles = membership.roles;
    row.isActive = membership.isActive;
    await em.persistAndFlush(row);
  }
  async withOrgOwnerGuard(
    orgId: string,
    targetUserId: string,
    decide: (ctx: { target: Membership | null; activeOwnerCount: number }) => Membership | null
  ): Promise<void> {
    await this.em.fork().transactional(async (em) => {
      // Verrou pessimiste sur les appartenances ACTIVES de l'org (sérialise les opérations owner).
      const active = await em.find(
        MembershipOrmEntity,
        { orgId, isActive: true },
        { lockMode: LockMode.PESSIMISTIC_WRITE }
      );
      const activeOwnerCount = active.filter((r) => r.roles.includes(Role.OWNER)).length;

      let targetRow = active.find((r) => r.userId === targetUserId) ?? null;
      if (!targetRow) {
        targetRow = await em.findOne(
          MembershipOrmEntity,
          { orgId, userId: targetUserId },
          { lockMode: LockMode.PESSIMISTIC_WRITE }
        );
      }
      const target = targetRow ? this.toDomain(targetRow) : null;

      const result = decide({ target, activeOwnerCount }); // lève en cas de violation -> rollback
      if (result) {
        const row = targetRow ?? new MembershipOrmEntity();
        row.id = result.id;
        row.orgId = result.orgId;
        row.userId = result.userId;
        row.roles = result.roles;
        row.isActive = result.isActive;
        await em.persistAndFlush(row);
      }
    });
  }
}
