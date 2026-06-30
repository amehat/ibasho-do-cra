import type { WhoamiResponse } from "@cra/contracts";
import { signBffToken } from "../utils/bffToken";

// Démontre le chemin signé BFF -> API gardée (AD-1, AD-14).
export default defineEventHandler(async (event): Promise<WhoamiResponse> => {
  const { apiBaseUrl, bffSharedSecret } = useRuntimeConfig();
  const token = signBffToken("demo-user", bffSharedSecret);
  try {
    return await $fetch<WhoamiResponse>(`${apiBaseUrl}/whoami`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status ?? 502;
    throw createError({ statusCode: status, statusMessage: "Échec de l'appel API gardée" });
  }
});
