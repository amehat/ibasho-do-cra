// GÉNÉRÉ — ne pas éditer à la main.
// Baseline committée pour que le front build avant la première génération.
// Régénéré par `pnpm generate:client` (openapi-typescript depuis l'OpenAPI de l'API). AD-12.
export interface HealthResponse {
  status: "ok";
  uptimeSeconds: number;
  db: "up" | "down" | "unknown";
}
export interface WhoamiResponse {
  userId: string;
}
