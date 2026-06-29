import { Injectable } from "@nestjs/common";
import { MikroORM } from "@mikro-orm/core";
import type { DbPing } from "../domain/ports/db-ping.port";

// Adapter : implémente le port via MikroORM (AD-2). Connexion paresseuse (connect:false).
@Injectable()
export class MikroDbPingAdapter implements DbPing {
  constructor(private readonly orm: MikroORM) {}
  async ping(): Promise<boolean> {
    try {
      await this.orm.em.getConnection().execute("select 1");
      return true;
    } catch {
      return false;
    }
  }
}
