<script setup lang="ts">
const model = defineModel<string>();
defineProps<{ id?: string }>();
</script>
<template>
  <input :id="id" v-model="model" type="date" class="input num" />
</template>
<style scoped>
.input { width: 100%; min-height: 44px; padding: 0 12px; border: 1px solid var(--line-2); border-radius: var(--r-control); background: var(--surface); font: 400 15px Inter; }
.input:focus { border-color: var(--accent); }
</style>
