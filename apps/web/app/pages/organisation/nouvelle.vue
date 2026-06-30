<script setup lang="ts">
import { useSession } from "~/stores/session";
const session = useSession();
const nom = ref("");
const type = ref<"prestataire" | "cliente">("prestataire");
const message = ref("");
const loading = ref(false);

async function submit() {
  message.value = "";
  loading.value = true;
  try {
    await $fetch("/api/organisations", { method: "POST", body: { nom: nom.value, type: type.value } });
    session.setProfile(await $fetch("/api/me"));
    await navigateTo("/");
  } catch {
    message.value = "Échec de la création.";
  } finally {
    loading.value = false;
  }
}
</script>
<template>
  <div class="wrap">
    <span class="eyebrow">Organisation</span>
    <h1 class="title">Nouvelle organisation</h1>
    <form class="form card" @submit.prevent="submit">
      <FormField label="Nom" for="nom" required>
        <BaseInput id="nom" v-model="nom" required :maxlength="200" />
      </FormField>
      <FormField label="Type" for="type" required>
        <select id="type" v-model="type" class="select">
          <option value="prestataire">Prestataire</option>
          <option value="cliente">Cliente</option>
        </select>
      </FormField>
      <ActionBar>
        <BaseButton type="submit" :loading="loading">Créer</BaseButton>
        <NuxtLink to="/"><BaseButton variant="secondary">Annuler</BaseButton></NuxtLink>
      </ActionBar>
      <p v-if="message" class="msg-err">{{ message }}</p>
    </form>
  </div>
</template>
<style scoped>
.wrap { max-width: 480px; }
.title { font: 700 26px Outfit; margin: 4px 0 var(--s-5); }
.form { padding: var(--s-5); display: flex; flex-direction: column; gap: var(--s-4); }
.select { width: 100%; min-height: 44px; padding: 0 12px; border: 1px solid var(--line-2); border-radius: var(--r-control); background: var(--surface); font: 400 15px Inter; }
.msg-err { color: var(--st-reject-ink); margin: 0; }
</style>
