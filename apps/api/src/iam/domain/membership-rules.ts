// Règle PURE de l'invariant AD-23 : une organisation garde toujours ≥ 1 propriétaire actif.
// L'application fournit le décompte (via le repo) ; le domaine décide.
export function assertNotLastActiveOwner(targetIsActiveOwner: boolean, activeOwnerCount: number): void {
  if (targetIsActiveOwner && activeOwnerCount <= 1) {
    throw new LastOwnerError();
  }
}

export class LastOwnerError extends Error {
  constructor() {
    super("Impossible : l'organisation doit conserver au moins un propriétaire actif");
    this.name = "LastOwnerError";
  }
}
