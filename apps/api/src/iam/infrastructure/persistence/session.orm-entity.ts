import { Entity, Index, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ tableName: "sessions" })
export class SessionOrmEntity {
  @PrimaryKey({ type: "string" }) token!: string;
  @Index() @Property({ type: "string", fieldName: "user_id" }) userId!: string;
  @Property({ type: "datetime", fieldName: "created_at" }) createdAt!: Date;
  @Property({ type: "datetime", fieldName: "expires_at" }) expiresAt!: Date;
  @Property({ type: "datetime", fieldName: "revoked_at", nullable: true }) revokedAt: Date | null = null;
}
