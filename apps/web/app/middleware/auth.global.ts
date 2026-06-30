import { useSession } from "~/stores/session";

const PUBLIC = ["/connexion", "/inscription"];

// Charge le profil (via le BFF, cookie forwardé en SSR) et redirige selon l'état d'auth.
export default defineNuxtRouteMiddleware(async (to) => {
  const session = useSession();
  if (!session.loaded) {
    const headers = import.meta.server ? useRequestHeaders(["cookie"]) : undefined;
    try {
      // /api/me renvoie null si non authentifié, et PROPAGE les erreurs transitoires.
      session.setProfile(await $fetch("/api/me", { headers }));
    } catch {
      // Panne transitoire (5xx/réseau) : ne pas déconnecter à tort. On ne fige pas l'état
      // (loaded reste faux -> nouvelle tentative à la navigation suivante) et on ne redirige pas.
      return;
    }
  }
  const isPublic = PUBLIC.includes(to.path);
  if (!session.isAuthenticated && !isPublic) return navigateTo("/connexion");
  if (session.isAuthenticated && isPublic) return navigateTo("/");
});
