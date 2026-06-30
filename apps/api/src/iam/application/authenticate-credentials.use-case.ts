import { Inject, Injectable } from "@nestjs/common";
import { Email } from "../domain/value-objects/email";
import { USER_REPOSITORY, type UserRepository } from "../domain/ports/user-repository.port";
import { PASSWORD_HASHER, type PasswordHasher } from "../domain/ports/password-hasher.port";
import { InvalidCredentialsError } from "./errors";

@Injectable()
export class AuthenticateCredentials {
  // Dérivé du vrai hasher au 1er appel : mêmes paramètres -> temps de verify égalisé (anti-oracle).
  private dummyHash: Promise<string> | null = null;

  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher
  ) {}

  private getDummyHash(): Promise<string> {
    return (this.dummyHash ??= this.hasher.hash("timing-equalizer-not-a-real-password"));
  }

  async execute(rawEmail: string, plainPassword: string): Promise<{ userId: string }> {
    let email: Email;
    try {
      email = Email.create(rawEmail);
    } catch {
      await this.hasher.verify(await this.getDummyHash(), plainPassword).catch(() => false);
      throw new InvalidCredentialsError();
    }
    const user = await this.users.findByEmail(email);
    if (!user || !user.isActive) {
      await this.hasher.verify(await this.getDummyHash(), plainPassword).catch(() => false);
      throw new InvalidCredentialsError();
    }
    if (!(await this.hasher.verify(user.passwordHash.value, plainPassword))) {
      throw new InvalidCredentialsError();
    }
    return { userId: user.id };
  }
}
