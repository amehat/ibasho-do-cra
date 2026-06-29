import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

// Entité baseline (socle) : prouve la chaîne migration -> schéma. Pas de métier ici.
// Types déclarés explicitement : indépendant de reflect-metadata (build tsc ET exécution tsx).
@Entity({ tableName: "health_check" })
export class HealthCheck {
  @PrimaryKey({ type: "number", autoincrement: true })
  id!: number;

  @Property({ type: "datetime", defaultRaw: "current_timestamp" })
  checkedAt: Date = new Date();
}
