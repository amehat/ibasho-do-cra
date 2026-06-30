import { describe, it, expect } from "vitest";
import { Membership } from "./membership";
import { Role } from "./role";

describe("Membership", () => {
  it("createOwner -> rôle OWNER, actif", () => {
    const m = Membership.createOwner("m1", "o1", "u1");
    expect(m.isOwner()).toBe(true);
    expect(m.isActive).toBe(true);
    expect(m.roles).toContain(Role.OWNER);
  });
  it("deactivate -> inactif (jamais supprimé, AD-11)", () => {
    const m = Membership.createOwner("m1", "o1", "u1");
    m.deactivate();
    expect(m.isActive).toBe(false);
    expect(m.isOwner()).toBe(true); // l'attribution survit
  });
});
