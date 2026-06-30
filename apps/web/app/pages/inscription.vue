<script setup lang="ts">
definePageMeta({ layout: "auth" });
const email = ref("");
const password = ref("");
const message = ref("");
const ok = ref(false);
const loading = ref(false);

async function submit() {
  message.value = "";
  loading.value = true;
  try {
    await $fetch("/api/auth/register", { method: "POST", body: { email: email.value, password: password.value } });
    ok.value = true;
    message.value = "Compte créé. Vous pouvez vous connecter.";
  } catch {
    ok.value = false;
    message.value = "Échec de l'inscription (email déjà utilisé ou invalide).";
  } finally {
    loading.value = false;
  }
}
</script>
<template>
  <div>
    <h1 class="title">Inscription</h1>
    <p class="sub">Créez votre compte.</p>
    <form class="form" @submit.prevent="submit">
      <FormField label="Email" for="email" required>
        <BaseInput id="email" v-model="email" type="email" required />
      </FormField>
      <FormField label="Mot de passe" for="pwd" required hint="8 caractères minimum.">
        <BaseInput id="pwd" v-model="password" type="password" :minlength="8" required />
      </FormField>
      <BaseButton type="submit" :loading="loading">Créer mon compte</BaseButton>
    </form>
    <p v-if="message" :class="ok ? 'msg-ok' : 'msg-err'">{{ message }}</p>
    <p class="alt">Déjà un compte ? <NuxtLink to="/connexion">Se connecter</NuxtLink></p>
  </div>
</template>
<style scoped>
.title { font: 700 26px Outfit; margin: 0 0 4px; }
.sub { color: var(--ink-2); margin: 0 0 var(--s-5); }
.form { display: flex; flex-direction: column; gap: var(--s-4); }
.alt { margin-top: var(--s-5); color: var(--ink-2); font-size: 14px; }
.msg-ok { margin-top: var(--s-4); color: var(--st-valid-ink); }
.msg-err { margin-top: var(--s-4); color: var(--st-reject-ink); }
</style>
