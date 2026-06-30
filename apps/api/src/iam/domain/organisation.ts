import { OrganisationType } from "./value-objects/organisation-type";
import { Membership } from "./membership";

// Agrégat PUR. La factory garantit l'invariant AD-23 à la création :
// toute organisation naît avec un propriétaire actif (son créateur).
export class Organisation {
  constructor(
    public readonly id: string,
    public readonly nom: string,
    public readonly type: OrganisationType
  ) {}

  static create(
    orgId: string,
    rawNom: string,
    rawType: string,
    ownerMembershipId: string,
    ownerUserId: string
  ): { organisation: Organisation; ownerMembership: Membership } {
    const nom = rawNom.trim();
    if (!nom || nom.length > 200) throw new InvalidOrganisationNameError();
    const type = OrganisationType.create(rawType);
    return {
      organisation: new Organisation(orgId, nom, type),
      ownerMembership: Membership.createOwner(ownerMembershipId, orgId, ownerUserId)
    };
  }
}
export class InvalidOrganisationNameError extends Error {
  constructor() { super("Nom d'organisation invalide (vide ou > 200 caractères)"); this.name = "InvalidOrganisationNameError"; }
}
