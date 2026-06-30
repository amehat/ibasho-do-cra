// Fail-fast prod : refuse un secret BFF faible/par défaut au démarrage du serveur Nuxt (AD-14).
const WEAK = new Set(["change_me_dev_only", "dev-bff-secret-change-in-prod"]);
export default defineNitroPlugin(() => {
  if (!import.meta.dev) {
    const { bffSharedSecret } = useRuntimeConfig();
    if (!bffSharedSecret || WEAK.has(bffSharedSecret) || bffSharedSecret.length < 16) {
      throw new Error("NUXT_BFF_SHARED_SECRET doit être défini, != valeur d'exemple, et >= 16 caractères en production.");
    }
  }
});
