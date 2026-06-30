// Nuxt = front + BFF (server/). Le navigateur ne parle qu'aux server routes (AD-1, AD-19).
export default defineNuxtConfig({
  compatibilityDate: "2025-06-01",
  modules: ["@pinia/nuxt"],
  css: ["~/assets/css/tokens.css"],
  components: [{ path: "~/components", pathPrefix: false }],
  runtimeConfig: {
    apiBaseUrl: "http://127.0.0.1:3001",
    bffSharedSecret: ""
  }
});
