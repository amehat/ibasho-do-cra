import { describe, it, expect } from "vitest";
import { assertNotLastActiveOwner, LastOwnerError } from "./membership-rules";

describe("assertNotLastActiveOwner (AD-23)", () => {
  it("refuse de retirer le dernier propriétaire actif", () => {
    expect(() => assertNotLastActiveOwner(true, 1)).toThrow(LastOwnerError);
  });
  it("autorise s'il reste d'autres propriétaires", () => {
    expect(() => assertNotLastActiveOwner(true, 2)).not.toThrow();
  });
  it("ne s'applique pas à un non-propriétaire", () => {
    expect(() => assertNotLastActiveOwner(false, 1)).not.toThrow();
  });
});
