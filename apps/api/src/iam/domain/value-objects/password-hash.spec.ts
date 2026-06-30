import { describe, it, expect } from "vitest";
import { PasswordHash } from "./password-hash";

describe("PasswordHash", () => {
  it("enveloppe une valeur hachée non vide", () => {
    expect(PasswordHash.fromHashed("$argon2id$...").value).toBe("$argon2id$...");
  });
  it("rejette une valeur vide", () => {
    expect(() => PasswordHash.fromHashed("")).toThrow();
  });
});
