import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import mikroOrmConfig from "./mikro-orm.config";
import { HealthModule } from "./health/health.module";
import { BffAuthModule } from "./shared-kernel/bff-auth/bff-auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    HealthModule,
    BffAuthModule
  ]
})
export class AppModule {}
