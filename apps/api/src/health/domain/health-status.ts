// Domaine PUR : aucune dépendance framework/ORM (AD-2).
export type DbState = "up" | "down" | "unknown";

export interface HealthSnapshot {
  status: "ok";
  uptimeSeconds: number;
  db: DbState;
}

export function buildHealthSnapshot(uptimeSeconds: number, dbReachable: boolean | null): HealthSnapshot {
  const db: DbState = dbReachable === null ? "unknown" : dbReachable ? "up" : "down";
  return { status: "ok", uptimeSeconds: Math.floor(uptimeSeconds), db };
}
