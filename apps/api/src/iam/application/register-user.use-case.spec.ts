import { describe, it, expect } from "vitest";
import { RegisterUser } from "./register-user.use-case";
import { EmailAlreadyUsedError } from "./errors";
import { User } from "../domain/user";
import { Email } from "../domain/value-objects/email";
import type { UserRepository } from "../domain/ports/user-repository.port";

function fakes() {
  const store = new Map<string, User>();
  const users: UserRepository = {
    async findByEmail(email) { return store.get(email.value) ?? null; },
    async save(user) { store.set(user.email.value, user); }
  };
  const hasher = { hash: async (p: string) => `h:${p}`, verify: async (h: string, p: string) => h === `h:${p}` };
  let n = 0;
  const ids = { newId: () => `id-${++n}` };
  return { users, hasher, ids, store };
}

describe("RegisterUser", () => {
  it("crée un compte avec mot de passe haché", async () => {
    const { users, hasher, ids, store } = fakes();
    const uc = new RegisterUser(users, hasher, ids);
    const { userId } = await uc.execute("New@Example.com", "motdepasse");
    expect(userId).toBe("id-1");
    const saved = store.get("new@example.com")!;
    expect(saved.passwordHash.value).toBe("h:motdepasse");
  });
  it("refuse un email déjà utilisé", async () => {
    const { users, hasher, ids } = fakes();
    await users.save(User.register("x", Email.create("dup@example.com"), { value: "h:y" } as never));
    const uc = new RegisterUser(users, hasher, ids);
    await expect(uc.execute("dup@example.com", "azertyui")).rejects.toBeInstanceOf(EmailAlreadyUsedError);
  });
});
