<script setup lang="ts">
// Polymorphe : avec `to`, rend un <NuxtLink> (ancre) stylé en bouton — jamais un
// <button> imbriqué dans une ancre (HTML invalide -> désync d'hydratation, nav morte).
defineProps<{
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  type?: "button" | "submit";
  to?: string;
  disabled?: boolean;
  loading?: boolean;
}>();
</script>
<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :class="['btn', `btn--${variant ?? 'primary'}`, { 'is-disabled': disabled || loading }]"
    :aria-disabled="disabled || loading || undefined"
    :aria-busy="loading || undefined"
    :tabindex="disabled || loading ? -1 : undefined"
  >
    <BaseIcon v-if="loading" name="clock" :size="16" class="spin" />
    <slot />
  </NuxtLink>
  <button
    v-else
    :type="type ?? 'button'"
    :class="['btn', `btn--${variant ?? 'primary'}`]"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
  >
    <BaseIcon v-if="loading" name="clock" :size="16" class="spin" />
    <slot />
  </button>
</template>
<style scoped>
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  min-height: 44px; padding: 0 18px; border-radius: var(--r-control);
  font: 600 14px/1 Inter; cursor: pointer; border: 1px solid transparent;
  text-decoration: none; box-sizing: border-box;
  transition: background 150ms ease-out, border-color 150ms ease-out, opacity 150ms ease-out;
}
.btn:disabled, .btn.is-disabled { opacity: .55; cursor: not-allowed; }
.btn.is-disabled { pointer-events: none; }
.btn--primary { background: var(--accent); color: #fff; }
.btn--primary:hover:not(:disabled) { background: var(--accent-strong); }
.btn--primary:active:not(:disabled) { background: var(--accent-ink); }
.btn--secondary { background: var(--surface); color: var(--ink); border-color: var(--line-2); }
.btn--secondary:hover:not(:disabled) { background: var(--surface-2); }
.btn--ghost { background: transparent; color: var(--accent-ink); }
.btn--ghost:hover:not(:disabled) { background: var(--accent-soft); }
.btn--destructive { background: var(--st-reject); color: #fff; }
.spin { animation: spin 800ms linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
