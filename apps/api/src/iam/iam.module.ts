import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { ThrottlerModule } from "@nestjs/throttler";
import { UserOrmEntity } from "./infrastructure/persistence/user.orm-entity";
import { SessionOrmEntity } from "./infrastructure/persistence/session.orm-entity";
import { MikroUserRepository } from "./infrastructure/persistence/mikro-user.repository";
import { MikroSessionRepository } from "./infrastructure/persistence/mikro-session.repository";
import { Argon2PasswordHasher } from "./infrastructure/security/argon2-password-hasher";
import { SystemClock } from "./infrastructure/system/system-clock";
import { UuidIdGenerator } from "./infrastructure/system/uuid-id-generator";
import { CryptoTokenGenerator } from "./infrastructure/system/crypto-token-generator";
import { AuthController } from "./infrastructure/http/auth.controller";
import { LoginThrottlerGuard } from "./infrastructure/http/login-throttler.guard";
import { RegisterUser } from "./application/register-user.use-case";
import { AuthenticateCredentials } from "./application/authenticate-credentials.use-case";
import { CreateSession } from "./application/create-session.use-case";
import { ResolveSession } from "./application/resolve-session.use-case";
import { RevokeSession } from "./application/revoke-session.use-case";
import { USER_REPOSITORY } from "./domain/ports/user-repository.port";
import { SESSION_REPOSITORY } from "./domain/ports/session-repository.port";
import { PASSWORD_HASHER } from "./domain/ports/password-hasher.port";
import { CLOCK } from "./domain/ports/clock.port";
import { ID_GENERATOR } from "./domain/ports/id-generator.port";
import { TOKEN_GENERATOR } from "./domain/ports/token-generator.port";

@Module({
  imports: [
    MikroOrmModule.forFeature([UserOrmEntity, SessionOrmEntity]),
    ThrottlerModule.forRoot([
      { name: "login-email", ttl: 60000, limit: 5 },   // 5/min par compte
      { name: "login-global", ttl: 60000, limit: 30 } // plafond /min par IP (anti-spraying)
    ])
  ],
  controllers: [AuthController],
  providers: [
    RegisterUser, AuthenticateCredentials, CreateSession, ResolveSession, RevokeSession,
    LoginThrottlerGuard,
    { provide: USER_REPOSITORY, useClass: MikroUserRepository },
    { provide: SESSION_REPOSITORY, useClass: MikroSessionRepository },
    { provide: PASSWORD_HASHER, useClass: Argon2PasswordHasher },
    { provide: CLOCK, useClass: SystemClock },
    { provide: ID_GENERATOR, useClass: UuidIdGenerator },
    { provide: TOKEN_GENERATOR, useClass: CryptoTokenGenerator }
  ]
})
export class IamModule {}
