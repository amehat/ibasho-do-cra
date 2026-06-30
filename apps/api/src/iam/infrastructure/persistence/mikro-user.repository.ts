import { Injectable } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/mariadb";
import { User } from "../../domain/user";
import { Email } from "../../domain/value-objects/email";
import { PasswordHash } from "../../domain/value-objects/password-hash";
import type { UserRepository } from "../../domain/ports/user-repository.port";
import { UserOrmEntity } from "./user.orm-entity";

@Injectable()
export class MikroUserRepository implements UserRepository {
  constructor(private readonly em: EntityManager) {}

  async findByEmail(email: Email): Promise<User | null> {
    const row = await this.em.fork().findOne(UserOrmEntity, { email: email.value });
    if (!row) return null;
    return new User(row.id, Email.create(row.email), PasswordHash.fromHashed(row.passwordHash), row.isActive);
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.em.fork().findOne(UserOrmEntity, { id });
    if (!row) return null;
    return new User(row.id, Email.create(row.email), PasswordHash.fromHashed(row.passwordHash), row.isActive);
  }

  async findByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) return [];
    const rows = await this.em.fork().find(UserOrmEntity, { id: { $in: ids } });
    return rows.map((row) => new User(row.id, Email.create(row.email), PasswordHash.fromHashed(row.passwordHash), row.isActive));
  }

  async save(user: User): Promise<void> {
    const em = this.em.fork();
    const row = (await em.findOne(UserOrmEntity, { id: user.id })) ?? new UserOrmEntity();
    row.id = user.id;
    row.email = user.email.value;
    row.passwordHash = user.passwordHash.value;
    row.isActive = user.isActive;
    await em.persistAndFlush(row);
  }
}
