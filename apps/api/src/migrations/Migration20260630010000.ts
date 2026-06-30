import { Migration } from "@mikro-orm/migrations";

// IAM : organisations + memberships (story 1.3). Jouée au déploiement, jamais au boot (AD-18).
export class Migration20260630010000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      "create table `organisations` (`id` varchar(36) not null, `nom` varchar(200) not null, " +
      "`type` varchar(20) not null, `created_at` datetime not null default current_timestamp(), " +
      "primary key (`id`), constraint `chk_org_type` check (`type` in ('prestataire','cliente'))) " +
      "default character set utf8mb4 engine = InnoDB;"
    );
    this.addSql(
      "create table `memberships` (`id` varchar(36) not null, `org_id` varchar(36) not null, " +
      "`user_id` varchar(36) not null, `roles` json not null, `is_active` tinyint(1) not null default true, " +
      "`created_at` datetime not null default current_timestamp(), primary key (`id`)) " +
      "default character set utf8mb4 engine = InnoDB;"
    );
    this.addSql("alter table `memberships` add index `memberships_org_id_index`(`org_id`);");
    this.addSql("alter table `memberships` add index `memberships_user_id_index`(`user_id`);");
    this.addSql(
      "alter table `memberships` add constraint `fk_memberships_org` " +
      "foreign key (`org_id`) references `organisations`(`id`) on update cascade;"
    );
  }
  override async down(): Promise<void> {
    this.addSql("alter table `memberships` drop foreign key `fk_memberships_org`;");
    this.addSql("drop table if exists `memberships`;");
    this.addSql("drop table if exists `organisations`;");
  }
}
