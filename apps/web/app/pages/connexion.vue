<script setup lang="ts">
import { useSession } from "~/stores/session";
definePageMeta({ layout: "auth" });
const session = useSession();
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function submit() {
  error.value = "";
  loading.value = true;
  try {
    await $fetch("/api/auth/login", { method: "POST", body: { email: email.value, password: password.value } });
    session.setProfile(await $fetch("/api/me"));
    await navigateTo("/");
  } catch {
    error.value = "Identifiants invalides.";
  } finally {
    loading.value = false;
  }
}
</script>
<template>
  <div>
    <h1 class="title">Connexion</h1>
    <p class="sub">Accédez à votre espace.</p>
    <form class="form" @submit.prevent="submit">
      <FormField label="Email" for="email" required>
        <BaseInput id="email" v-model="email" type="email" required placeholder="vous@exemple.fr" />
      </FormField>
      <FormField label="Mot de passe" for="pwd" required :error="error">
        <BaseInput id="pwd" v-model="password" type="password" required />
      </FormField>
      <BaseButton type="submit" :loading="loading">Se connecter</BaseButton>
    </form>
    <p class="alt">Pas de compte ? <NuxtLink to="/inscription">S'inscrire</NuxtLink></p>
  </div>
</template>
<style scoped>
.title { font: 700 26px Outfit; margin: 0 0 4px; }
.sub { color: var(--ink-2); margin: 0 0 var(--s-5); }
.form { display: flex; flex-direction: column; gap: var(--s-4); }
.alt { margin-top: var(--s-5); color: var(--ink-2); font-size: 14px; }
</style>
