import { Email } from "./value-objects/email";
import { PasswordHash } from "./value-objects/password-hash";

// Agrégat User PUR (AD-2). Pas d'ORM, pas de framework.
export class User {
  constructor(
    public readonly id: string,
    public readonly email: Email,
    public readonly passwordHash: PasswordHash,
    public readonly isActive: boolean = true
  ) {}

  static register(id: string, email: Email, passwordHash: PasswordHash): User {
    return new User(id, email, passwordHash, true);
  }
}
