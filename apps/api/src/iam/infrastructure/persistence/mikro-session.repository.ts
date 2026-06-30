import { Injectable } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/mariadb";
import { Session } from "../../domain/session";
import type { SessionRepository } from "../../domain/ports/session-repository.port";
import { SessionOrmEntity } from "./session.orm-entity";

@Injectable()
export class MikroSessionRepository implements SessionRepository {
  constructor(private readonly em: EntityManager) {}

  async findByToken(token: string): Promise<Session | null> {
    const row = await this.em.fork().findOne(SessionOrmEntity, { token });
    if (!row) return null;
    return new Session(row.token, row.userId, row.createdAt, row.expiresAt, row.revokedAt);
  }

  async save(session: Session): Promise<void> {
    const em = this.em.fork();
    const row = (await em.findOne(SessionOrmEntity, { token: session.token })) ?? new SessionOrmEntity();
    row.token = session.token;
    row.userId = session.userId;
    row.createdAt = session.createdAt;
    row.expiresAt = session.expiresAt;
    row.revokedAt = session.revokedAt;
    await em.persistAndFlush(row);
  }
}
