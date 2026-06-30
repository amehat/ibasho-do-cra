import type { HealthResponse } from "@cra/contracts";

// Relais santé : le navigateur appelle /api/health (BFF), jamais l'API directement (AD-1, AD-19).
// Si l'API est injoignable (cold-start), on renvoie un état dégradé plutôt qu'une 500 brute.
export default defineEventHandler(async (): Promise<HealthResponse> => {
  const { apiBaseUrl } = useRuntimeConfig();
  try {
    return await $fetch<HealthResponse>(`${apiBaseUrl}/health`);
  } catch {
    return { status: "ok", uptimeSeconds: 0, db: "unknown" };
  }
});
