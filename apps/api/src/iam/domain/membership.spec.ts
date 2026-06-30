import { describe, it, expect } from "vitest";
import { Membership } from "./membership";
import { Role } from "./role";

describe("Membership", () => {
  it("createOwner -> rôle OWNER, actif", () => {
    const m = Membership.createOwner("m1", "o1", "u1");
    expect(m.isOwner()).toBe(true);
    expect(m.isActive).toBe(true);
  });
  it("setRoles remplace les rôles (cumul possible)", () => {
    const m = Membership.createOwner("m1", "o1", "u1");
    m.setRoles([Role.OWNER, Role.PRESTATAIRE]);
    expect(m.hasRole(Role.PRESTATAIRE)).toBe(true);
    expect(m.hasRole(Role.OWNER)).toBe(true);
  });
  it("deactivate puis reactivate (AD-11 : jamais supprimé)", () => {
    const m = Membership.createOwner("m1", "o1", "u1");
    m.deactivate();
    expect(m.isActive).toBe(false);
    m.reactivate([Role.VALIDEUR]);
    expect(m.isActive).toBe(true);
    expect(m.roles).toEqual([Role.VALIDEUR]);
  });
});
