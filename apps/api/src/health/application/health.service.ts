import { Inject, Injectable } from "@nestjs/common";
import { buildHealthSnapshot, type HealthSnapshot } from "../domain/health-status";
import { DB_PING, type DbPing } from "../domain/ports/db-ping.port";

@Injectable()
export class HealthService {
  constructor(@Inject(DB_PING) private readonly dbPing: DbPing) {}

  async check(): Promise<HealthSnapshot> {
    let reachable: boolean | null;
    try {
      reachable = await this.dbPing.ping();
    } catch {
      reachable = null;
    }
    return buildHealthSnapshot(process.uptime(), reachable);
  }
}
