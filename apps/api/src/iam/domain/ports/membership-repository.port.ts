import type { Membership } from "../membership";

export const MEMBERSHIP_REPOSITORY = Symbol("MEMBERSHIP_REPOSITORY");
export interface MembershipRepository {
  findActiveByUser(userId: string): Promise<Membership[]>;
  findActiveOwnersByOrg(orgId: string): Promise<Membership[]>;
  findByOrgAndUser(orgId: string, userId: string): Promise<Membership | null>;
  findByOrg(orgId: string): Promise<Membership[]>; // actifs + inactifs (vue admin)
  save(membership: Membership): Promise<void>;
}
