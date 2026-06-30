import { Injectable } from "@nestjs/common";
import { MikroORM } from "@mikro-orm/core";
import type { DbPing } from "../domain/ports/db-ping.port";

// Adapter : implémente le port via MikroORM (AD-2). Ping borné en temps -> /health ne pend jamais.
@Injectable()
export class MikroDbPingAdapter implements DbPing {
  constructor(private readonly orm: MikroORM) {}
  async ping(): Promise<boolean> {
    const probe = this.orm.em
      .getConnection()
      .execute("select 1")
      .then(() => true)
      .catch(() => false);
    const timeout = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 2500));
    return Promise.race([probe, timeout]);
  }
}
