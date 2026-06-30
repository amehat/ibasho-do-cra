<script setup lang="ts">
// Saisie monétaire (utilisée par les écrans projet/CRA des Epics suivants). Suffixe €, tabular.
const model = defineModel<number>();
defineProps<{ id?: string; placeholder?: string }>();
</script>
<template>
  <div class="money">
    <input :id="id" v-model.number="model" type="number" step="0.01" min="0" :placeholder="placeholder" class="input num" />
    <span class="suffix" aria-hidden="true">€</span>
  </div>
</template>
<style scoped>
.money { position: relative; }
.input { width: 100%; min-height: 44px; padding: 0 28px 0 12px; border: 1px solid var(--line-2); border-radius: var(--r-control); background: var(--surface); font: 400 15px Inter; }
.input:focus { border-color: var(--accent); }
.suffix { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--ink-3); }
</style>
