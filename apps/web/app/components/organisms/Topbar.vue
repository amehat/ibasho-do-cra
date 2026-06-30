<script setup lang="ts">
import { useSession } from "~/stores/session";
const emit = defineEmits<{ toggle: [] }>();
const session = useSession();
const role = computed(() => session.allRoles[0] ?? "membre");

async function logout() {
  await $fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  session.setProfile(null);
  await navigateTo("/connexion");
}
</script>
<template>
  <header class="topbar">
    <button class="burger" aria-label="Ouvrir le menu" @click="emit('toggle')">
      <BaseIcon name="menu" :size="20" />
    </button>
    <div class="ctx"><slot name="context" /></div>
    <div class="right">
      <button class="bell" aria-label="Notifications">
        <BaseIcon name="bell" :size="18" />
      </button>
      <div class="me">
        <span class="avatar" aria-hidden="true"><BaseIcon name="user" :size="16" /></span>
        <span class="meta">
          <span class="email num">{{ session.profile?.email ?? "—" }}</span>
          <Badge tone="accent">{{ role }}</Badge>
        </span>
      </div>
      <button class="logout" aria-label="Se déconnecter" title="Se déconnecter" @click="logout">
        <BaseIcon name="log-out" :size="18" />
      </button>
    </div>
  </header>
</template>
<style scoped>
.topbar { height: 64px; display: flex; align-items: center; gap: var(--s-3); padding: 0 var(--s-5); background: var(--surface); border-bottom: 1px solid var(--line); }
.burger { display: none; background: none; border: 0; min-width: 44px; min-height: 44px; align-items: center; justify-content: center; border-radius: var(--r-control); cursor: pointer; color: var(--ink); }
.ctx { flex: 1; font: 600 15px Inter; color: var(--ink-2); }
.right { display: flex; align-items: center; gap: var(--s-4); }
.bell { background: none; border: 1px solid var(--line); border-radius: var(--r-control); cursor: pointer; color: var(--ink-2); min-height: 44px; min-width: 44px; display: inline-flex; align-items: center; justify-content: center; }
.logout { background: none; border: 1px solid var(--line); border-radius: var(--r-control); cursor: pointer; color: var(--ink-2); min-height: 44px; min-width: 44px; display: inline-flex; align-items: center; justify-content: center; }
.logout:hover { color: var(--st-reject); border-color: var(--st-reject); }
.me { display: flex; align-items: center; gap: 10px; }
.avatar { width: 34px; height: 34px; border-radius: 999px; background: var(--accent-soft); color: var(--accent-ink); display: grid; place-items: center; }
.meta { display: flex; flex-direction: column; gap: 2px; }
.email { font: 500 12.5px Inter; color: var(--ink); }
@media (max-width: 1023px) { .burger { display: inline-flex; } }
</style>
