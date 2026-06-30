import { Inject, Injectable } from "@nestjs/common";
import { Email } from "../domain/value-objects/email";
import { USER_REPOSITORY, type UserRepository } from "../domain/ports/user-repository.port";
import { PASSWORD_HASHER, type PasswordHasher } from "../domain/ports/password-hasher.port";
import { InvalidCredentialsError } from "./errors";

// Hash factice pour égaliser le temps quand l'email est inconnu (anti-oracle de timing).
const DUMMY_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHRzb21lc2FsdA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

@Injectable()
export class AuthenticateCredentials {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher
  ) {}

  async execute(rawEmail: string, plainPassword: string): Promise<{ userId: string }> {
    let email: Email;
    try {
      email = Email.create(rawEmail);
    } catch {
      await this.hasher.verify(DUMMY_HASH, plainPassword).catch(() => false);
      throw new InvalidCredentialsError();
    }
    const user = await this.users.findByEmail(email);
    if (!user || !user.isActive) {
      await this.hasher.verify(DUMMY_HASH, plainPassword).catch(() => false);
      throw new InvalidCredentialsError();
    }
    if (!(await this.hasher.verify(user.passwordHash.value, plainPassword))) {
      throw new InvalidCredentialsError();
    }
    return { userId: user.id };
  }
}
