// Nuxt = front + BFF (server/). Le navigateur ne parle qu'aux server routes (AD-1, AD-19).
export default defineNuxtConfig({
  compatibilityDate: "2025-06-01",
  modules: ["@pinia/nuxt"],
  runtimeConfig: {
    // privé (serveur uniquement) : jamais exposé au navigateur. À fournir par env en prod.
    apiBaseUrl: "http://127.0.0.1:3001",
    bffSharedSecret: "" // surchargé par NUXT_BFF_SHARED_SECRET ; vide => signBffToken échoue (fail-fast)
  }
});
