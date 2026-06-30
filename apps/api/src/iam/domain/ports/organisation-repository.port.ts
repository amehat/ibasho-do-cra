import type { Organisation } from "../organisation";
import type { Membership } from "../membership";

export const ORGANISATION_REPOSITORY = Symbol("ORGANISATION_REPOSITORY");
export interface OrganisationRepository {
  // Persiste l'organisation ET sa membership propriétaire dans une seule transaction (atomicité AD-23).
  saveNewWithOwner(organisation: Organisation, owner: Membership): Promise<void>;
  findByIds(ids: string[]): Promise<Organisation[]>;
}
