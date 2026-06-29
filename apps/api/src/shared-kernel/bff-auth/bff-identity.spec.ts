import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { verifyBffToken } from "./bff-identity";

const SECRET = "test-secret";

describe("verifyBffToken (AD-14)", () => {
  it("extrait le userId d'un JWT signé valide", () => {
    const token = jwt.sign({ sub: "user-123" }, SECRET, { algorithm: "HS256", expiresIn: "1m" });
    expect(verifyBffToken(token, SECRET)).toEqual({ userId: "user-123" });
  });

  it("rejette un JWT signé avec le mauvais secret", () => {
    const token = jwt.sign({ sub: "user-123" }, "wrong", { algorithm: "HS256" });
    expect(() => verifyBffToken(token, SECRET)).toThrow();
  });

  it("rejette un JWT sans sub", () => {
    const token = jwt.sign({ foo: "bar" }, SECRET, { algorithm: "HS256" });
    expect(() => verifyBffToken(token, SECRET)).toThrow();
  });
});
