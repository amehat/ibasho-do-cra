import type { CreateOrganisationInput, OrganisationIdResponse } from "@cra/contracts";
import { signBffToken } from "../../utils/bffToken";
import { resolveIdentity } from "../../utils/resolveIdentity";
import { upstreamError } from "../../utils/upstream";

export default defineEventHandler(async (event) => {
  const userId = await resolveIdentity(event);
  if (!userId) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });
  const { apiBaseUrl, bffSharedSecret } = useRuntimeConfig();
  const body = await readBody<Partial<CreateOrganisationInput>>(event);
  try {
    return await $fetch<OrganisationIdResponse>(`${apiBaseUrl}/organisations`, {
      method: "POST",
      headers: { Authorization: `Bearer ${signBffToken(userId, bffSharedSecret)}` },
      body: { nom: body?.nom, type: body?.type }
    });
  } catch (err) {
    upstreamError(err);
  }
});
