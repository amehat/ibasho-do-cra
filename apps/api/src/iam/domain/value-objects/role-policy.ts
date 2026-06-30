import { Role } from "../role";
import type { OrganisationTypeValue } from "./organisation-type";

// Règle PURE (AD-13/domaine) : quels rôles sont valides selon le type d'organisation.
const ALLOWED_BY_TYPE: Record<OrganisationTypeValue, Role[]> = {
  prestataire: [Role.OWNER, Role.PRESTATAIRE],
  cliente: [Role.OWNER, Role.VALIDEUR, Role.PAYEUR]
};

export function rolesAllowedForOrgType(type: OrganisationTypeValue): Role[] {
  return ALLOWED_BY_TYPE[type];
}

export function assertRolesValidForOrgType(roles: Role[], type: OrganisationTypeValue): void {
  if (roles.length === 0) throw new InvalidRolesError("au moins un rôle est requis");
  const allowed = ALLOWED_BY_TYPE[type];
  const invalid = roles.filter((r) => !allowed.includes(r));
  if (invalid.length > 0) {
    throw new InvalidRolesError(`rôles invalides pour une organisation ${type} : ${invalid.join(", ")}`);
  }
}

export class InvalidRolesError extends Error {
  constructor(msg: string) { super(`Rôles invalides : ${msg}`); this.name = "InvalidRolesError"; }
}
