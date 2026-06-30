<script setup lang="ts">
import { useSession } from "~/stores/session";
import { navItemsForRoles } from "~/utils/nav";

const session = useSession();
const route = useRoute();
const items = computed(() => navItemsForRoles(session.allRoles));
const ownerOrgId = computed(() => session.ownerOrgs[0]?.id ?? "");

function hrefFor(to: string): string {
  return to === "/organisation/membres" && ownerOrgId.value ? `${to}?orgId=${ownerOrgId.value}` : to;
}
function isActive(to: string): boolean {
  return route.path === to;
}
</script>
<template>
  <nav class="sidebar" aria-label="Navigation principale">
    <div class="brand">
      <span class="logo">CRA</span>
    </div>
    <ul class="nav">
      <li v-for="item in items" :key="item.to">
        <NuxtLink :to="hrefFor(item.to)" class="item" :class="{ active: isActive(item.to) }" :aria-current="isActive(item.to) ? 'page' : undefined">
          <span class="rail" aria-hidden="true" />
          <BaseIcon :name="item.icon" :size="18" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
<style scoped>
.sidebar { width: var(--sidebar-w); background: var(--shell); color: var(--shell-ink); height: 100%; display: flex; flex-direction: column; padding: var(--s-4) 0; }
.brand { padding: 0 var(--s-5) var(--s-5); }
.logo { font: 700 20px Outfit; color: #fff; letter-spacing: .02em; }
.nav { list-style: none; margin: 0; padding: 0 var(--s-3); display: flex; flex-direction: column; gap: 2px; }
.item { display: flex; align-items: center; gap: 12px; position: relative; padding: 11px 12px; border-radius: var(--r-control); color: var(--shell-ink); font: 500 14px Inter; min-height: 44px; }
.item:hover { background: rgba(255,255,255,.06); color: #fff; text-decoration: none; }
.item.active { color: #fff; background: rgba(255,255,255,.08); }
.rail { position: absolute; left: 0; top: 8px; bottom: 8px; width: 3px; border-radius: 3px; background: transparent; }
.item.active .rail { background: var(--accent); }
</style>
