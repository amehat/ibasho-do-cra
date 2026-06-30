import type { H3Event } from "h3";
import { signBffOrigin } from "./bffToken";

export const SESSION_COOKIE = "cra_session";

// Lit le cookie de session, demande à l'API IAM le userId (AD-14, AD-19). null si non/plus valide.
export async function resolveIdentity(event: H3Event): Promise<string | null> {
  const { apiBaseUrl, bffSharedSecret } = useRuntimeConfig();
  const token = getCookie(event, SESSION_COOKIE);
  if (!token) return null;
  try {
    const res = await $fetch<{ userId: string }>(`${apiBaseUrl}/auth/session`, {
      headers: { Authorization: `Bearer ${signBffOrigin(bffSharedSecret)}`, "x-session-token": token }
    });
    return res.userId;
  } catch {
    return null;
  }
}
