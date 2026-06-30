import type { Membership } from "../../domain/membership";

// Politique d'autorisation (AD-9/AD-10) : l'acteur doit être propriétaire ACTIF de l'organisation.
export const MEMBERSHIP_POLICY = Symbol("MEMBERSHIP_POLICY");
export interface MembershipPolicy {
  requireActiveOwner(actorUserId: string, orgId: string): Promise<Membership>;
}
