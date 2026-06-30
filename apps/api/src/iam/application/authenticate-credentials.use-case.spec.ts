import { describe, it, expect } from "vitest";
import { AuthenticateCredentials } from "./authenticate-credentials.use-case";
import { InvalidCredentialsError } from "./errors";
import { User } from "../domain/user";
import { Email } from "../domain/value-objects/email";
import { PasswordHash } from "../domain/value-objects/password-hash";
import type { UserRepository } from "../domain/ports/user-repository.port";

function setup() {
  const u = User.register("u1", Email.create("a@example.com"), PasswordHash.fromHashed("h:bonmdp"));
  const users: UserRepository = {
    async findByEmail(email) { return email.value === "a@example.com" ? u : null; },
    async findById(id) { return id === "u1" ? u : null; },
    async save() {}
  };
  const hasher = { hash: async (p: string) => `h:${p}`, verify: async (h: string, p: string) => h === `h:${p}` };
  return new AuthenticateCredentials(users, hasher);
}

describe("AuthenticateCredentials", () => {
  it("réussit avec les bons identifiants", async () => {
    expect(await setup().execute("a@example.com", "bonmdp")).toEqual({ userId: "u1" });
  });
  it("échoue (générique) avec un mauvais mot de passe", async () => {
    await expect(setup().execute("a@example.com", "faux")).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
  it("échoue (générique) avec un email inconnu", async () => {
    await expect(setup().execute("inconnu@example.com", "x")).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
