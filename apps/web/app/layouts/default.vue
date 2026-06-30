<script setup lang="ts">
const mobileOpen = ref(false);
</script>
<template>
  <div class="shell">
    <aside class="aside" :class="{ open: mobileOpen }">
      <AppSidebar />
    </aside>
    <div v-if="mobileOpen" class="scrim" @click="mobileOpen = false" />
    <div class="main">
      <Topbar @toggle="mobileOpen = !mobileOpen" />
      <main class="content">
        <slot />
      </main>
    </div>
  </div>
</template>
<style scoped>
.shell { display: flex; min-height: 100vh; }
.aside { flex: 0 0 var(--sidebar-w); }
.main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.content { padding: var(--s-6); max-width: 1240px; width: 100%; margin: 0 auto; }
.scrim { display: none; }
@media (max-width: 1023px) {
  .aside { position: fixed; inset: 0 auto 0 0; z-index: 40; transform: translateX(-100%); transition: transform 200ms ease-out; }
  .aside.open { transform: translateX(0); }
  .scrim { display: block; position: fixed; inset: 0; background: rgba(20,23,30,.35); z-index: 35; }
  .content { padding: var(--s-4); }
}
</style>
