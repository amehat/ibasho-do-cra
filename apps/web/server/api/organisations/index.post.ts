import { signBffToken } from "../../utils/bffToken";
import { resolveIdentity } from "../../utils/resolveIdentity";
import { upstreamError } from "../../utils/upstream";

export default defineEventHandler(async (event) => {
  const userId = await resolveIdentity(event);
  if (!userId) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });
  const { apiBaseUrl, bffSharedSecret } = useRuntimeConfig();
  const body = await readBody<{ nom?: string; type?: string }>(event);
  try {
    return await $fetch(`${apiBaseUrl}/organisations`, {
      method: "POST",
      headers: { Authorization: `Bearer ${signBffToken(userId, bffSharedSecret)}` },
      body: { nom: body?.nom, type: body?.type }
    });
  } catch (err) {
    upstreamError(err);
  }
});
