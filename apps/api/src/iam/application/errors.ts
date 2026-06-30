export class EmailAlreadyUsedError extends Error {
  constructor() { super("Email déjà utilisé"); this.name = "EmailAlreadyUsedError"; }
}
export class InvalidCredentialsError extends Error {
  constructor() { super("Identifiants invalides"); this.name = "InvalidCredentialsError"; }
}
export class InvalidSessionError extends Error {
  constructor() { super("Session invalide"); this.name = "InvalidSessionError"; }
}

export class ForbiddenMembershipError extends Error {
  constructor() { super("Action réservée à un propriétaire de l'organisation"); this.name = "ForbiddenMembershipError"; }
}
export class OrganisationNotFoundError extends Error {
  constructor() { super("Organisation introuvable"); this.name = "OrganisationNotFoundError"; }
}
export class UserNotFoundError extends Error {
  constructor() { super("Utilisateur introuvable"); this.name = "UserNotFoundError"; }
}
export class MemberNotFoundError extends Error {
  constructor() { super("Membre introuvable dans cette organisation"); this.name = "MemberNotFoundError"; }
}
