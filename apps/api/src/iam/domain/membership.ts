import { Role } from "./role";

// Agrégat PUR : lien user <-> organisation. Désactivable, jamais supprimé (AD-11). Rôles cumulables (FR4).
export class Membership {
  constructor(
    public readonly id: string,
    public readonly orgId: string,
    public readonly userId: string,
    public roles: Role[],
    public isActive: boolean = true
  ) {}

  static createOwner(id: string, orgId: string, userId: string): Membership {
    return new Membership(id, orgId, userId, [Role.OWNER], true);
  }

  hasRole(role: Role): boolean {
    return this.roles.includes(role);
  }

  isOwner(): boolean {
    return this.hasRole(Role.OWNER);
  }

  setRoles(roles: Role[]): void {
    this.roles = [...new Set(roles)]; // dédoublonne (FR4 : ensemble de rôles)
  }

  // Réactive une membership désactivée (AD-11) en remplaçant ses rôles — sert à la ré-affectation idempotente.
  reactivate(roles: Role[]): void {
    this.isActive = true;
    this.roles = [...new Set(roles)];
  }

  deactivate(): void {
    this.isActive = false;
  }
}
