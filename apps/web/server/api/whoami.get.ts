import type { WhoamiResponse } from "@cra/contracts";
import { signBffToken } from "../utils/bffToken";

// Démontre le chemin signé BFF -> API gardée (AD-1, AD-14).
export default defineEventHandler(async (): Promise<WhoamiResponse> => {
  const { apiBaseUrl, bffSharedSecret } = useRuntimeConfig();
  const token = signBffToken("demo-user", bffSharedSecret);
  return await $fetch<WhoamiResponse>(`${apiBaseUrl}/whoami`, {
    headers: { Authorization: `Bearer ${token}` }
  });
});
