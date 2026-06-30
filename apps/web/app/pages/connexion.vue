<script setup lang="ts">
const email = ref("");
const password = ref("");
const message = ref("");
async function submit() {
  try {
    const res = await $fetch<{ userId: string }>("/api/auth/login", {
      method: "POST",
      body: { email: email.value, password: password.value }
    });
    message.value = `Connecté (${res.userId}).`;
  } catch {
    message.value = "Identifiants invalides.";
  }
}
</script>
<template>
  <main style="font-family: system-ui; padding: 2rem; max-width: 420px;">
    <h1>Connexion</h1>
    <form @submit.prevent="submit">
      <label>Email <input v-model="email" type="email" required /></label>
      <label>Mot de passe <input v-model="password" type="password" required /></label>
      <button type="submit">Se connecter</button>
    </form>
    <p>{{ message }}</p>
    <NuxtLink to="/inscription">Pas de compte ? S'inscrire</NuxtLink>
  </main>
</template>
