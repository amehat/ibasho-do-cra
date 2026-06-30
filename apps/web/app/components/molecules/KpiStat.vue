<script setup lang="ts">
defineProps<{ label: string; value: string | number }>();
</script>
<template>
  <div class="kpi card">
    <span class="eyebrow">{{ label }}</span>
    <span class="val num">{{ value }}</span>
  </div>
</template>
<style scoped>
.kpi { padding: var(--s-4); display: flex; flex-direction: column; gap: 6px; }
.val { font: 700 28px/1 Outfit; color: var(--ink); }
</style>
