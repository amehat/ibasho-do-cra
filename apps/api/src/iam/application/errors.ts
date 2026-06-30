export class EmailAlreadyUsedError extends Error {
  constructor() { super("Email déjà utilisé"); this.name = "EmailAlreadyUsedError"; }
}
export class InvalidCredentialsError extends Error {
  constructor() { super("Identifiants invalides"); this.name = "InvalidCredentialsError"; }
}
export class InvalidSessionError extends Error {
  constructor() { super("Session invalide"); this.name = "InvalidSessionError"; }
}
