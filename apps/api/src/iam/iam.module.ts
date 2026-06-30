import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { ThrottlerModule } from "@nestjs/throttler";
import { UserOrmEntity } from "./infrastructure/persistence/user.orm-entity";
import { SessionOrmEntity } from "./infrastructure/persistence/session.orm-entity";
import { OrganisationOrmEntity } from "./infrastructure/persistence/organisation.orm-entity";
import { MembershipOrmEntity } from "./infrastructure/persistence/membership.orm-entity";
import { MikroOrganisationRepository } from "./infrastructure/persistence/mikro-organisation.repository";
import { MikroMembershipRepository } from "./infrastructure/persistence/mikro-membership.repository";
import { OrganisationController } from "./infrastructure/http/organisation.controller";
import { CreateOrganisation } from "./application/create-organisation.use-case";
import { ListMyOrganisations } from "./application/list-my-organisations.use-case";
import { ORGANISATION_REPOSITORY } from "./domain/ports/organisation-repository.port";
import { MEMBERSHIP_REPOSITORY } from "./domain/ports/membership-repository.port";
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
    MikroOrmModule.forFeature([UserOrmEntity, SessionOrmEntity, OrganisationOrmEntity, MembershipOrmEntity]),
    ThrottlerModule.forRoot([
      { name: "login-email", ttl: 60000, limit: 5 },   // 5/min par compte
      { name: "login-global", ttl: 60000, limit: 30 } // plafond /min par IP (anti-spraying)
    ])
  ],
  controllers: [AuthController, OrganisationController],
  providers: [
    RegisterUser, AuthenticateCredentials, CreateSession, ResolveSession, RevokeSession,
    CreateOrganisation, ListMyOrganisations,
    LoginThrottlerGuard,
    { provide: USER_REPOSITORY, useClass: MikroUserRepository },
    { provide: SESSION_REPOSITORY, useClass: MikroSessionRepository },
    { provide: PASSWORD_HASHER, useClass: Argon2PasswordHasher },
    { provide: CLOCK, useClass: SystemClock },
    { provide: ID_GENERATOR, useClass: UuidIdGenerator },
    { provide: TOKEN_GENERATOR, useClass: CryptoTokenGenerator },
    { provide: ORGANISATION_REPOSITORY, useClass: MikroOrganisationRepository },
    { provide: MEMBERSHIP_REPOSITORY, useClass: MikroMembershipRepository }
  ]
})
export class IamModule {}
