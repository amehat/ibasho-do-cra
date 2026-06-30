import { signBffToken } from "../../utils/bffToken";
import { resolveIdentity } from "../../utils/resolveIdentity";
import { upstreamError } from "../../utils/upstream";

export default defineEventHandler(async (event) => {
  const userId = await resolveIdentity(event);
  if (!userId) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });
  const { apiBaseUrl, bffSharedSecret } = useRuntimeConfig();
  try {
    return await $fetch(`${apiBaseUrl}/organisations`, {
      headers: { Authorization: `Bearer ${signBffToken(userId, bffSharedSecret)}` }
    });
  } catch (err) {
    upstreamError(err);
  }
});
