// Port (interface) : l'application en dépend, l'infrastructure l'implémente (AD-2).
export const DB_PING = Symbol("DB_PING");
export interface DbPing {
  ping(): Promise<boolean>;
}
