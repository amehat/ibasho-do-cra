import { Entity, Index, PrimaryKey, Property } from "@mikro-orm/core";
import { Role } from "../../domain/role";

@Entity({ tableName: "memberships" })
export class MembershipOrmEntity {
  @PrimaryKey({ type: "string" }) id!: string;
  @Index() @Property({ type: "string", fieldName: "org_id" }) orgId!: string;
  @Index() @Property({ type: "string", fieldName: "user_id" }) userId!: string;
  @Property({ type: "json" }) roles: Role[] = [];
  @Property({ type: "boolean", fieldName: "is_active", default: true }) isActive: boolean = true;
  @Property({ type: "datetime", fieldName: "created_at", defaultRaw: "current_timestamp()" }) createdAt: Date = new Date();
}
