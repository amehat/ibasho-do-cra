// Contrat d'API consommé par le front (AD-12). Types DÉRIVÉS du schéma généré (anti-drift) :
// si l'API change, `schema.ts` est régénéré en CI et tout écart casse le build/diff.
import type { components } from "./generated/schema.js";

export type HealthResponse = components["schemas"]["HealthResponseDto"];
export type WhoamiResponse = components["schemas"]["WhoamiResponseDto"];
