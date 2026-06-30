import type { Membership } from "../membership";

export const MEMBERSHIP_REPOSITORY = Symbol("MEMBERSHIP_REPOSITORY");
export interface MembershipRepository {
  findActiveByUser(userId: string): Promise<Membership[]>;
  findActiveOwnersByOrg(orgId: string): Promise<Membership[]>;
  findByOrgAndUser(orgId: string, userId: string): Promise<Membership | null>;
  findByOrg(orgId: string): Promise<Membership[]>; // actifs + inactifs (vue admin)
  save(membership: Membership): Promise<void>;
  // Garde transactionnelle de l'invariant AD-23 : verrouille les membres actifs de l'org,
  // fournit le décompte des propriétaires actifs, applique la décision, persiste — atomique.
  withOrgOwnerGuard(
    orgId: string,
    targetUserId: string,
    decide: (ctx: { target: Membership | null; activeOwnerCount: number }) => Membership | null
  ): Promise<void>;
}
