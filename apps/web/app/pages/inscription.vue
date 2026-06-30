<script setup lang="ts">
const email = ref("");
const password = ref("");
const message = ref("");
async function submit() {
  try {
    await $fetch("/api/auth/register", { method: "POST", body: { email: email.value, password: password.value } });
    message.value = "Compte créé. Vous pouvez vous connecter.";
  } catch {
    message.value = "Échec de l'inscription.";
  }
}
</script>
<template>
  <main style="font-family: system-ui; padding: 2rem; max-width: 420px;">
    <h1>Inscription</h1>
    <form @submit.prevent="submit">
      <label>Email <input v-model="email" type="email" required /></label>
      <label>Mot de passe <input v-model="password" type="password" minlength="8" required /></label>
      <button type="submit">Créer mon compte</button>
    </form>
    <p>{{ message }}</p>
    <NuxtLink to="/connexion">Déjà un compte ? Se connecter</NuxtLink>
  </main>
</template>
