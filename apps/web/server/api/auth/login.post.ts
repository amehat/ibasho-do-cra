import { signBffOrigin } from "../../utils/bffToken";
import { SESSION_COOKIE } from "../../utils/resolveIdentity";
import { upstreamError } from "../../utils/upstream";

export default defineEventHandler(async (event) => {
  const { apiBaseUrl, bffSharedSecret } = useRuntimeConfig();
  const body = await readBody<{ email?: string; password?: string }>(event);
  try {
    const res = await $fetch<{ token: string; userId: string; expiresAt: string }>(`${apiBaseUrl}/auth/login`, {
      method: "POST",
      headers: { Authorization: `Bearer ${signBffOrigin(bffSharedSecret)}` },
      body: { email: body?.email, password: body?.password }
    });
    // Cookie httpOnly : le jeton de session ne quitte jamais le serveur (AD-14).
    setCookie(event, SESSION_COOKIE, res.token, {
      httpOnly: true,
      secure: !import.meta.dev,
      sameSite: "lax",
      path: "/",
      expires: new Date(res.expiresAt)
    });
    return { userId: res.userId };
  } catch (err) {
    upstreamError(err);
  }
});
