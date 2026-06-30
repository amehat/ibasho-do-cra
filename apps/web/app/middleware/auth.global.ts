import { useSession } from "~/stores/session";

const PUBLIC = ["/connexion", "/inscription"];

// Charge le profil (via le BFF, cookie forwardé en SSR) et redirige selon l'état d'auth.
export default defineNuxtRouteMiddleware(async (to) => {
  const session = useSession();
  if (!session.loaded) {
    try {
      const headers = import.meta.server ? useRequestHeaders(["cookie"]) : undefined;
      session.setProfile(await $fetch("/api/me", { headers }));
    } catch {
      session.setProfile(null);
    }
  }
  const isPublic = PUBLIC.includes(to.path);
  if (!session.isAuthenticated && !isPublic) return navigateTo("/connexion");
  if (session.isAuthenticated && isPublic) return navigateTo("/");
});
