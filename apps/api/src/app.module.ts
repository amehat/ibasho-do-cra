import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import mikroOrmConfig from "./mikro-orm.config";
import { HealthModule } from "./health/health.module";
import { BffAuthModule } from "./shared-kernel/bff-auth/bff-auth.module";
import { BffIdentityGuard } from "./shared-kernel/bff-auth/bff-identity.guard";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    HealthModule,
    BffAuthModule
  ],
  // Default-deny : la garde BFF s'applique à TOUTE route, sauf @Public() (AD-14).
  providers: [{ provide: APP_GUARD, useClass: BffIdentityGuard }]
})
export class AppModule {}
