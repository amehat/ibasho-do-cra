import { Migration } from "@mikro-orm/migrations";

// IAM : tables users + sessions (story 1.2). Jouée au déploiement, jamais au boot (AD-18).
export class Migration20260630000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      "create table `users` (`id` varchar(36) not null, `email` varchar(320) not null, " +
      "`password_hash` varchar(255) not null, `is_active` tinyint(1) not null default true, " +
      "`created_at` datetime not null default current_timestamp(), primary key (`id`)) " +
      "default character set utf8mb4 engine = InnoDB;"
    );
    this.addSql("alter table `users` add unique `users_email_unique`(`email`);");
    this.addSql(
      "create table `sessions` (`token` varchar(64) not null, `user_id` varchar(36) not null, " +
      "`created_at` datetime not null, `expires_at` datetime not null, `revoked_at` datetime null, " +
      "primary key (`token`)) default character set utf8mb4 engine = InnoDB;"
    );
    this.addSql("alter table `sessions` add index `sessions_user_id_index`(`user_id`);");
  }

  override async down(): Promise<void> {
    this.addSql("drop table if exists `sessions`;");
    this.addSql("drop table if exists `users`;");
  }
}
