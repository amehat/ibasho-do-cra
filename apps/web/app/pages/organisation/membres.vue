<script setup lang="ts">
import type { Member } from "@cra/contracts";
const route = useRoute();
const orgId = computed(() => String(route.query.orgId ?? ""));
const email = ref("");
const role = ref("prestataire");
const message = ref("");
const loading = ref(false);

const { data: members, refresh } = await useFetch<Member[]>(() => `/api/organisations/${orgId.value}/members`, {
  watch: [orgId]
});

async function add() {
  message.value = "";
  loading.value = true;
  try {
    await $fetch(`/api/organisations/${orgId.value}/members`, { method: "POST", body: { email: email.value, roles: [role.value] } });
    email.value = "";
    await refresh();
  } catch {
    message.value = "Échec (droits, email inconnu, ou rôle invalide pour le type d'organisation).";
  } finally {
    loading.value = false;
  }
}
async function deactivate(userId: string) {
  try {
    await $fetch(`/api/organisations/${orgId.value}/members/${userId}`, { method: "DELETE" });
    await refresh();
  } catch {
    message.value = "Impossible de désactiver (dernier propriétaire ?).";
  }
}
</script>
<template>
  <div>
    <span class="eyebrow">Organisation</span>
    <h1 class="title">Membres</h1>

    <form class="add card" @submit.prevent="add">
      <FormField label="Email du membre" for="email">
        <BaseInput id="email" v-model="email" type="email" placeholder="membre@exemple.fr" required />
      </FormField>
      <FormField label="Rôle" for="role">
        <select id="role" v-model="role" class="select">
          <option value="prestataire">prestataire</option>
          <option value="valideur">valideur</option>
          <option value="payeur">payeur</option>
          <option value="owner">owner</option>
        </select>
      </FormField>
      <BaseButton type="submit" :loading="loading">Ajouter</BaseButton>
    </form>
    <p v-if="message" class="msg-err">{{ message }}</p>

    <ul class="list">
      <li v-for="m in members" :key="m.userId" class="row card">
        <div class="who">
          <span class="email num">{{ m.email ?? m.userId }}</span>
          <div class="roles"><Badge v-for="r in m.roles" :key="r">{{ r }}</Badge></div>
        </div>
        <StatusPill :status="m.isActive ? 'actif' : 'inactif'" />
        <BaseButton v-if="m.isActive" variant="ghost" @click="deactivate(m.userId)">Désactiver</BaseButton>
      </li>
    </ul>
  </div>
</template>
<style scoped>
.title { font: 700 26px Outfit; margin: 4px 0 var(--s-5); }
.add { padding: var(--s-5); display: grid; grid-template-columns: 1fr auto auto; gap: var(--s-4); align-items: end; }
.select { min-height: 44px; padding: 0 12px; border: 1px solid var(--line-2); border-radius: var(--r-control); background: var(--surface); font: 400 15px Inter; }
.list { list-style: none; padding: 0; margin: var(--s-5) 0 0; display: flex; flex-direction: column; gap: var(--s-3); }
.row { padding: var(--s-4) var(--s-5); display: flex; align-items: center; gap: var(--s-4); }
.who { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.email { font: 500 14px Inter; }
.roles { display: flex; gap: 6px; flex-wrap: wrap; }
.msg-err { color: var(--st-reject-ink); }
@media (max-width: 767px) { .add { grid-template-columns: 1fr; } }
</style>
