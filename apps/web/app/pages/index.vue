<script setup lang="ts">
import { useSession } from "~/stores/session";
const session = useSession();
</script>
<template>
  <div>
    <header class="head">
      <div>
        <span class="eyebrow">Tableau de bord</span>
        <h1 class="title">Bonjour</h1>
      </div>
      <BaseButton to="/organisation/nouvelle">+ Nouvelle organisation</BaseButton>
    </header>

    <section v-if="session.organisations.length" class="grid">
      <article v-for="org in session.organisations" :key="org.id" class="card org">
        <h2 class="org-nom">{{ org.nom }}</h2>
        <div class="roles">
          <Badge v-for="r in org.roles" :key="r" tone="accent">{{ r }}</Badge>
        </div>
        <NuxtLink v-if="org.roles.includes('owner')" :to="`/organisation/membres?orgId=${org.id}`" class="link">
          Gérer les membres <BaseIcon name="chevron-right" :size="15" />
        </NuxtLink>
      </article>
    </section>

    <div v-else class="empty card">
      <p>Aucune organisation pour l'instant.</p>
      <BaseButton to="/organisation/nouvelle">Créer ma première organisation</BaseButton>
    </div>
  </div>
</template>
<style scoped>
.head { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--s-6); gap: var(--s-4); flex-wrap: wrap; }
.title { font: 700 30px Outfit; margin: 4px 0 0; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--s-4); }
.org { padding: var(--s-5); display: flex; flex-direction: column; gap: var(--s-3); }
.org-nom { font: 600 18px Outfit; margin: 0; }
.roles { display: flex; gap: 6px; flex-wrap: wrap; }
.link { display: inline-flex; align-items: center; gap: 4px; font: 500 14px Inter; }
.empty { padding: var(--s-7); display: flex; flex-direction: column; align-items: flex-start; gap: var(--s-4); color: var(--ink-2); }
</style>
