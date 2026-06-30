import type { User } from "../user";
import type { Email } from "../value-objects/email";

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");
export interface UserRepository {
  findByEmail(email: Email): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
