import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ tableName: "organisations" })
export class OrganisationOrmEntity {
  @PrimaryKey({ type: "string" }) id!: string;
  @Property({ type: "string" }) nom!: string;
  @Property({ type: "string" }) type!: string;
  @Property({ type: "datetime", fieldName: "created_at", defaultRaw: "current_timestamp()" }) createdAt: Date = new Date();
}
