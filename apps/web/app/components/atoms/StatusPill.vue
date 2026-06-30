<script setup lang="ts">
import { statusPreset } from "./status-presets";
const props = defineProps<{ status: string }>();
const p = computed(() => statusPreset(props.status));
</script>
<template>
  <!-- Statut = point + icône + libellé, jamais la couleur seule (AD-20). -->
  <span class="pill" :style="{ background: `var(--st-${p.variant}-bg)`, color: `var(--st-${p.variant}-ink)` }">
    <span class="dot" :style="{ background: `var(--st-${p.variant})` }" aria-hidden="true" />
    <BaseIcon :name="p.icon" :size="13" />
    <span class="label">{{ p.label }}</span>
  </span>
</template>
<style scoped>
.pill { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: var(--r-pill); font: 600 12.5px/1 Inter; white-space: nowrap; }
.dot { width: 7px; height: 7px; border-radius: 999px; flex: 0 0 auto; }
</style>
