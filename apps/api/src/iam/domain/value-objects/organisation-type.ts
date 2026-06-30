// VO PUR : type d'organisation (côté prestataire ou côté client).
export type OrganisationTypeValue = "prestataire" | "cliente";

export class OrganisationType {
  private constructor(public readonly value: OrganisationTypeValue) {}
  static create(raw: string): OrganisationType {
    if (raw !== "prestataire" && raw !== "cliente") throw new InvalidOrganisationTypeError(raw);
    return new OrganisationType(raw);
  }
}
export class InvalidOrganisationTypeError extends Error {
  constructor(raw: string) { super(`Type d'organisation invalide: ${raw}`); this.name = "InvalidOrganisationTypeError"; }
}
