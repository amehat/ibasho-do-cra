<script setup lang="ts">
import type { Member } from "@cra/contracts";
// Page brute (design = story 1.5). Accès via le BFF uniquement (AD-19).
const route = useRoute();
const orgId = computed(() => String(route.query.orgId ?? ""));
const email = ref("");
const role = ref("prestataire");
const message = ref("");
const { data: members, refresh } = await useFetch<Member[]>(() => `/api/organisations/${orgId.value}/members`, {
  immediate: false
});
async function add() {
  try {
    await $fetch(`/api/organisations/${orgId.value}/members`, { method: "POST", body: { email: email.value, roles: [role.value] } });
    message.value = "Membre ajouté.";
    await refresh();
  } catch {
    message.value = "Échec (droits, email inconnu, ou rôle invalide).";
  }
}
</script>
<template>
  <main style="font-family: system-ui; padding: 2rem; max-width: 560px;">
    <h1>Membres de l'organisation</h1>
    <p>orgId : <input v-model="route.query.orgId" placeholder="id d'organisation" @change="refresh()" /></p>
    <form @submit.prevent="add">
      <input v-model="email" type="email" placeholder="email du membre" required />
      <select v-model="role">
        <option value="prestataire">prestataire</option>
        <option value="valideur">valideur</option>
        <option value="payeur">payeur</option>
        <option value="owner">owner</option>
      </select>
      <button type="submit">Ajouter</button>
    </form>
    <p>{{ message }}</p>
    <ul>
      <li v-for="m in members" :key="m.userId">{{ m.email }} — {{ m.roles.join(", ") }} — {{ m.isActive ? "actif" : "inactif" }}</li>
    </ul>
  </main>
</template>
