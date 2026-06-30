import type { MyProfile } from "@cra/contracts";
import { signBffToken } from "../utils/bffToken";
import { resolveIdentity } from "../utils/resolveIdentity";
import { upstreamError } from "../utils/upstream";

// Profil courant (identité + organisations/rôles) via l'API authentifiée (AD-19, AD-14). null si non connecté.
export default defineEventHandler(async (event): Promise<MyProfile | null> => {
  const userId = await resolveIdentity(event);
  if (!userId) return null;
  const { apiBaseUrl, bffSharedSecret } = useRuntimeConfig();
  try {
    return await $fetch<MyProfile>(`${apiBaseUrl}/me`, {
      headers: { Authorization: `Bearer ${signBffToken(userId, bffSharedSecret)}` }
    });
  } catch (err) {
    // 401 = identité invalide/expirée (ex. compte supprimé) -> non authentifié.
    // Toute autre erreur (5xx, réseau, secret BFF manquant) est PROPAGÉE pour ne pas
    // déconnecter à tort un utilisateur valide lors d'une panne transitoire.
    if ((err as { response?: { status?: number } })?.response?.status === 401) return null;
    upstreamError(err);
  }
});
