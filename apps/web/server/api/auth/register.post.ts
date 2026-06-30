import { signBffOrigin } from "../../utils/bffToken";
import { upstreamError } from "../../utils/upstream";

export default defineEventHandler(async (event) => {
  const { apiBaseUrl, bffSharedSecret } = useRuntimeConfig();
  const body = await readBody<{ email?: string; password?: string }>(event);
  try {
    return await $fetch<{ userId: string }>(`${apiBaseUrl}/auth/register`, {
      method: "POST",
      headers: { Authorization: `Bearer ${signBffOrigin(bffSharedSecret)}` },
      body: { email: body?.email, password: body?.password }
    });
  } catch (err) {
    upstreamError(err);
  }
});
