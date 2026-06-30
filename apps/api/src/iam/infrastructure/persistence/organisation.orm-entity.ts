import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ tableName: "organisations" })
export class OrganisationOrmEntity {
  @PrimaryKey({ type: "string", length: 36 }) id!: string;
  @Property({ type: "string", length: 200 }) nom!: string;
  @Property({ type: "string", length: 20 }) type!: string;
  @Property({ type: "datetime", fieldName: "created_at", defaultRaw: "current_timestamp()" }) createdAt: Date = new Date();
}
