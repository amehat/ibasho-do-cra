<script setup lang="ts">
const model = defineModel<boolean>();
defineProps<{ id?: string; label?: string }>();
</script>
<template>
  <label class="cb">
    <input :id="id" v-model="model" type="checkbox" />
    <span v-if="label">{{ label }}</span>
  </label>
</template>
<style scoped>
.cb { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; cursor: pointer; }
.cb input { width: 18px; height: 18px; accent-color: var(--accent); }
</style>
