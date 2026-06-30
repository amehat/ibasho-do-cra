import { Role } from "./role";

// Agrégat PUR : lien user <-> organisation. Désactivable, jamais supprimé (AD-11).
export class Membership {
  constructor(
    public readonly id: string,
    public readonly orgId: string,
    public readonly userId: string,
    public readonly roles: Role[],
    public isActive: boolean = true
  ) {}

  static createOwner(id: string, orgId: string, userId: string): Membership {
    return new Membership(id, orgId, userId, [Role.OWNER], true);
  }

  isOwner(): boolean {
    return this.roles.includes(Role.OWNER);
  }

  deactivate(): void {
    this.isActive = false;
  }
}
