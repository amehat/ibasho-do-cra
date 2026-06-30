import { describe, it, expect } from "vitest";
import { Session } from "./session";

describe("Session", () => {
  const now = new Date("2026-06-30T10:00:00Z");
  it("est valide avant expiration, invalide après", () => {
    const s = Session.start("tok", "u1", now, 1000 * 60);
    expect(s.isValid(now)).toBe(true);
    expect(s.isValid(new Date(now.getTime() + 1000 * 61))).toBe(false);
  });
  it("révoquée -> invalide", () => {
    const s = Session.start("tok", "u1", now, 1000 * 60 * 60);
    s.revoke(now);
    expect(s.isValid(now)).toBe(false);
    expect(s.revokedAt).toEqual(now);
  });
});
