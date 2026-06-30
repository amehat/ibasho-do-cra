<script setup lang="ts">
// Formulaire brut (design système = story 1.5). Accès données via le BFF uniquement (AD-19).
const nom = ref("");
const type = ref<"prestataire" | "cliente">("prestataire");
const message = ref("");
async function submit() {
  try {
    const res = await $fetch<{ organisationId: string }>("/api/organisations", {
      method: "POST",
      body: { nom: nom.value, type: type.value }
    });
    message.value = `Organisation créée (${res.organisationId}).`;
  } catch {
    message.value = "Échec de la création (es-tu connecté ?).";
  }
}
</script>
<template>
  <main style="font-family: system-ui; padding: 2rem; max-width: 460px;">
    <h1>Nouvelle organisation</h1>
    <form @submit.prevent="submit">
      <label>Nom <input v-model="nom" required maxlength="200" /></label>
      <label>Type
        <select v-model="type">
          <option value="prestataire">Prestataire</option>
          <option value="cliente">Cliente</option>
        </select>
      </label>
      <button type="submit">Créer</button>
    </form>
    <p>{{ message }}</p>
  </main>
</template>
