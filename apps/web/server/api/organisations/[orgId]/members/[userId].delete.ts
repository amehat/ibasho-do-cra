import { signBffToken } from "../../../../utils/bffToken";
import { resolveIdentity } from "../../../../utils/resolveIdentity";
import { upstreamError } from "../../../../utils/upstream";

export default defineEventHandler(async (event) => {
  const actorId = await resolveIdentity(event);
  if (!actorId) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });
  const { apiBaseUrl, bffSharedSecret } = useRuntimeConfig();
  const orgId = getRouterParam(event, "orgId");
  const userId = getRouterParam(event, "userId");
  try {
    return await $fetch(`${apiBaseUrl}/organisations/${orgId}/members/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${signBffToken(actorId, bffSharedSecret)}` }
    });
  } catch (err) {
    upstreamError(err);
  }
});
