import type { AddMemberInput, AddMemberResponse } from "@cra/contracts";
import { signBffToken } from "../../../../utils/bffToken";
import { resolveIdentity } from "../../../../utils/resolveIdentity";
import { upstreamError } from "../../../../utils/upstream";

export default defineEventHandler(async (event): Promise<AddMemberResponse> => {
  const userId = await resolveIdentity(event);
  if (!userId) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });
  const { apiBaseUrl, bffSharedSecret } = useRuntimeConfig();
  const orgId = getRouterParam(event, "orgId");
  const body = await readBody<Partial<AddMemberInput>>(event);
  try {
    return await $fetch<AddMemberResponse>(`${apiBaseUrl}/organisations/${orgId}/members`, {
      method: "POST",
      headers: { Authorization: `Bearer ${signBffToken(userId, bffSharedSecret)}` },
      body: { email: body?.email, roles: body?.roles }
    });
  } catch (err) {
    upstreamError(err);
  }
});
