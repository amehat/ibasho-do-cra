import { signBffOrigin } from "../../utils/bffToken";
import { SESSION_COOKIE } from "../../utils/resolveIdentity";

export default defineEventHandler(async (event) => {
  const { apiBaseUrl, bffSharedSecret } = useRuntimeConfig();
  const token = getCookie(event, SESSION_COOKIE);
  if (token) {
    await $fetch(`${apiBaseUrl}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${signBffOrigin(bffSharedSecret)}`, "x-session-token": token }
    }).catch(() => {});
  }
  deleteCookie(event, SESSION_COOKIE, { path: "/" });
  return { ok: true };
});
