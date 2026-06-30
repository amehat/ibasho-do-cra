import { Migration } from "@mikro-orm/migrations";

// Unicité d'appartenance (org, user) — résout le point différé de la story 1.3.
// La ré-affectation d'un membre désactivé réactive la ligne existante (pas d'insert).
export class Migration20260630020000 extends Migration {
  override async up(): Promise<void> {
    this.addSql("alter table `memberships` add unique `memberships_org_user_unique`(`org_id`, `user_id`);");
  }
  override async down(): Promise<void> {
    this.addSql("alter table `memberships` drop index `memberships_org_user_unique`;");
  }
}
