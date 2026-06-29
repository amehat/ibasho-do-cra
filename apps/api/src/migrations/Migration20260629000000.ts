import { Migration } from "@mikro-orm/migrations";

// Migration baseline du socle (AD-18 : jouée au déploiement, jamais au boot).
export class Migration20260629000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      "create table `health_check` (`id` int unsigned not null auto_increment primary key, " +
      "`checked_at` datetime not null default current_timestamp) default character set utf8mb4 engine = InnoDB;"
    );
  }
  override async down(): Promise<void> {
    this.addSql("drop table if exists `health_check`;");
  }
}
