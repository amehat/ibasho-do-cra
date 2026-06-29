import { Module } from "@nestjs/common";
import { HealthController } from "./infrastructure/health.controller";
import { HealthService } from "./application/health.service";
import { DB_PING } from "./domain/ports/db-ping.port";
import { MikroDbPingAdapter } from "./infrastructure/mikro-db-ping.adapter";

@Module({
  controllers: [HealthController],
  providers: [HealthService, { provide: DB_PING, useClass: MikroDbPingAdapter }]
})
export class HealthModule {}
