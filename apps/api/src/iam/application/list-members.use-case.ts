import { Inject, Injectable } from "@nestjs/common";
import { Role } from "../domain/role";
import { MEMBERSHIP_REPOSITORY, type MembershipRepository } from "../domain/ports/membership-repository.port";
import { USER_REPOSITORY, type UserRepository } from "../domain/ports/user-repository.port";
import { MEMBERSHIP_POLICY, type MembershipPolicy } from "./ports/membership-policy.port";

export interface MemberView {
  userId: string;
  email: string | null;
  roles: Role[];
  isActive: boolean;
}

@Injectable()
export class ListMembers {
  constructor(
    @Inject(MEMBERSHIP_POLICY) private readonly policy: MembershipPolicy,
    @Inject(MEMBERSHIP_REPOSITORY) private readonly memberships: MembershipRepository,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository
  ) {}

  async execute(actorId: string, orgId: string): Promise<MemberView[]> {
    await this.policy.requireActiveOwner(actorId, orgId);
    const members = await this.memberships.findByOrg(orgId);
    const users = await this.users.findByIds(members.map((m) => m.userId));
    const emailById = new Map(users.map((u) => [u.id, u.email.value]));
    return members.map((m) => ({
      userId: m.userId,
      email: emailById.get(m.userId) ?? null,
      roles: m.roles,
      isActive: m.isActive
    }));
  }
}
