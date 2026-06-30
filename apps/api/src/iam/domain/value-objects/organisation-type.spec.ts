import { describe, it, expect } from "vitest";
import { OrganisationType, InvalidOrganisationTypeError } from "./organisation-type";

describe("OrganisationType", () => {
  it("accepte prestataire et cliente", () => {
    expect(OrganisationType.create("prestataire").value).toBe("prestataire");
    expect(OrganisationType.create("cliente").value).toBe("cliente");
  });
  it("refuse un type inconnu", () => {
    expect(() => OrganisationType.create("autre")).toThrow(InvalidOrganisationTypeError);
  });
});
