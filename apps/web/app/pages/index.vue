<script setup lang="ts">
// Accès données via le BFF uniquement (AD-19) — jamais d'appel direct à l'API.
const { data: health } = await useFetch("/api/health");
</script>

<template>
  <main style="font-family: system-ui; padding: 2rem;">
    <h1>Gestionnaire de CRA — socle</h1>
    <p>Statut API (via BFF) : <strong>{{ health?.status ?? "…" }}</strong> · db: {{ health?.db }}</p>
  </main>
</template>
