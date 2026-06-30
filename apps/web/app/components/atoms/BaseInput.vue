<script setup lang="ts">
const model = defineModel<string>();
defineProps<{ id?: string; type?: string; placeholder?: string; required?: boolean; minlength?: number; maxlength?: number }>();
</script>
<template>
  <input
    :id="id" v-model="model" :type="type ?? 'text'" :placeholder="placeholder"
    :required="required" :minlength="minlength" :maxlength="maxlength" class="input"
  />
</template>
<style scoped>
.input {
  width: 100%; min-height: 44px; padding: 0 12px; border: 1px solid var(--line-2);
  border-radius: var(--r-control); background: var(--surface); color: var(--ink);
  font: 400 15px/1.4 Inter; transition: border-color 150ms ease-out;
}
.input:hover { border-color: var(--ink-3); }
.input:focus { border-color: var(--accent); }
.input::placeholder { color: var(--ink-3); }
</style>
