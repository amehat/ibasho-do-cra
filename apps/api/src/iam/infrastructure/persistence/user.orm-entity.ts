import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ tableName: "users" })
export class UserOrmEntity {
  @PrimaryKey({ type: "string" }) id!: string;
  @Property({ type: "string", unique: true }) email!: string;
  @Property({ type: "string", fieldName: "password_hash" }) passwordHash!: string;
  @Property({ type: "boolean", fieldName: "is_active", default: true }) isActive: boolean = true;
  @Property({ type: "datetime", fieldName: "created_at", defaultRaw: "current_timestamp()" }) createdAt: Date = new Date();
}
