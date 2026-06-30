<script setup lang="ts">
defineProps<{ tone?: "neutral" | "accent" }>();
</script>
<template>
  <span :class="['badge', `badge--${tone ?? 'neutral'}`]"><slot /></span>
</template>
<style scoped>
.badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: var(--r-pill); font: 600 11.5px/1 Inter; }
.badge--neutral { background: var(--surface-2); color: var(--ink-2); border: 1px solid var(--line); }
.badge--accent { background: var(--accent-soft); color: var(--accent-ink); }
</style>
