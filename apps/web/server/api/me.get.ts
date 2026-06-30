import type { MyProfile } from "@cra/contracts";
import { signBffToken } from "../utils/bffToken";
import { resolveIdentity } from "../utils/resolveIdentity";

// Profil courant (identité + organisations/rôles) via l'API authentifiée (AD-19, AD-14). null si non connecté.
export default defineEventHandler(async (event): Promise<MyProfile | null> => {
  const userId = await resolveIdentity(event);
  if (!userId) return null;
  const { apiBaseUrl, bffSharedSecret } = useRuntimeConfig();
  try {
    return await $fetch<MyProfile>(`${apiBaseUrl}/me`, {
      headers: { Authorization: `Bearer ${signBffToken(userId, bffSharedSecret)}` }
    });
  } catch {
    return null;
  }
});
