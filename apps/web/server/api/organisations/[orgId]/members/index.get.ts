import type { Member } from "@cra/contracts";
import { signBffToken } from "../../../../utils/bffToken";
import { resolveIdentity } from "../../../../utils/resolveIdentity";
import { upstreamError } from "../../../../utils/upstream";

export default defineEventHandler(async (event): Promise<Member[]> => {
  const userId = await resolveIdentity(event);
  if (!userId) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });
  const { apiBaseUrl, bffSharedSecret } = useRuntimeConfig();
  const orgId = getRouterParam(event, "orgId");
  try {
    return await $fetch<Member[]>(`${apiBaseUrl}/organisations/${orgId}/members`, {
      headers: { Authorization: `Bearer ${signBffToken(userId, bffSharedSecret)}` }
    });
  } catch (err) {
    upstreamError(err);
  }
});
