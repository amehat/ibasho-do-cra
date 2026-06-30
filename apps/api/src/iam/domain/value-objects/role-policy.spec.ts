import { describe, it, expect } from "vitest";
import { assertRolesValidForOrgType, InvalidRolesError } from "./role-policy";
import { Role } from "../role";

describe("role-policy", () => {
  it("accepte owner+prestataire pour une orga prestataire", () => {
    expect(() => assertRolesValidForOrgType([Role.OWNER, Role.PRESTATAIRE], "prestataire")).not.toThrow();
  });
  it("accepte valideur+payeur pour une orga cliente", () => {
    expect(() => assertRolesValidForOrgType([Role.VALIDEUR, Role.PAYEUR], "cliente")).not.toThrow();
  });
  it("refuse valideur pour une orga prestataire", () => {
    expect(() => assertRolesValidForOrgType([Role.VALIDEUR], "prestataire")).toThrow(InvalidRolesError);
  });
  it("refuse une liste de rôles vide", () => {
    expect(() => assertRolesValidForOrgType([], "cliente")).toThrow(InvalidRolesError);
  });
});
