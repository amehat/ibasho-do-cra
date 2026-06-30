import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

// Entité baseline (socle) : prouve la chaîne migration -> schéma. Pas de métier ici.
@Entity({ tableName: "health_check" })
export class HealthCheck {
  @PrimaryKey({ type: "number", autoincrement: true })
  id!: number;

  @Property({ type: "datetime", defaultRaw: "current_timestamp()" })
  checkedAt: Date = new Date();
}
