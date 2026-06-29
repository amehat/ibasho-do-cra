import type { HealthResponse } from "@cra/contracts";

// Relais santé : le navigateur appelle /api/health (BFF), jamais l'API directement (AD-1, AD-19).
export default defineEventHandler(async (): Promise<HealthResponse> => {
  const { apiBaseUrl } = useRuntimeConfig();
  return await $fetch<HealthResponse>(`${apiBaseUrl}/health`);
});
