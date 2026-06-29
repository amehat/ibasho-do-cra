import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { signBffToken } from "../server/utils/bffToken";

describe("signBffToken (AD-14)", () => {
  it("produit un JWT HS256 vérifiable portant le userId dans sub", () => {
    const token = signBffToken("user-42", "secret");
    const decoded = jwt.verify(token, "secret") as jwt.JwtPayload;
    expect(decoded.sub).toBe("user-42");
  });

  it("n'est pas vérifiable avec un autre secret", () => {
    const token = signBffToken("user-42", "secret");
    expect(() => jwt.verify(token, "autre")).toThrow();
  });
});
