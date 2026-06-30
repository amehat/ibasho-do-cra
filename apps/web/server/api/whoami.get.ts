import type { WhoamiResponse } from "@cra/contracts";
import { signBffToken } from "../utils/bffToken";
import { resolveIdentity } from "../utils/resolveIdentity";
import { upstreamError } from "../utils/upstream";

// Chemin authentifié : session -> userId -> JWT d'identité -> API gardée (AD-1, AD-14).
export default defineEventHandler(async (event): Promise<WhoamiResponse> => {
  const { apiBaseUrl, bffSharedSecret } = useRuntimeConfig();
  const userId = await resolveIdentity(event);
  if (!userId) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });
  try {
    return await $fetch<WhoamiResponse>(`${apiBaseUrl}/whoami`, {
      headers: { Authorization: `Bearer ${signBffToken(userId, bffSharedSecret)}` }
    });
  } catch (err) {
    upstreamError(err);
  }
});
