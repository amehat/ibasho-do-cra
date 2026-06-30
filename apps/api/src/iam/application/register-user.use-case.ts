import { Inject, Injectable } from "@nestjs/common";
import { Email } from "../domain/value-objects/email";
import { PasswordHash } from "../domain/value-objects/password-hash";
import { User } from "../domain/user";
import { USER_REPOSITORY, type UserRepository } from "../domain/ports/user-repository.port";
import { PASSWORD_HASHER, type PasswordHasher } from "../domain/ports/password-hasher.port";
import { ID_GENERATOR, type IdGenerator } from "../domain/ports/id-generator.port";
import { EmailAlreadyUsedError } from "./errors";

@Injectable()
export class RegisterUser {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator
  ) {}

  async execute(rawEmail: string, plainPassword: string): Promise<{ userId: string }> {
    const email = Email.create(rawEmail);
    if (await this.users.findByEmail(email)) throw new EmailAlreadyUsedError();
    const hash = PasswordHash.fromHashed(await this.hasher.hash(plainPassword));
    const user = User.register(this.ids.newId(), email, hash);
    await this.users.save(user);
    return { userId: user.id };
  }
}
