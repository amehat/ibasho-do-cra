<script setup lang="ts">
defineProps<{ label: string; for?: string; error?: string; required?: boolean; hint?: string }>();
</script>
<template>
  <div class="field">
    <label v-if="label" :for="$props.for" class="lbl">
      {{ label }}<span v-if="required" class="req" aria-hidden="true"> *</span>
    </label>
    <slot />
    <p v-if="hint && !error" class="hint">{{ hint }}</p>
    <p v-if="error" class="err" role="alert">{{ error }}</p>
  </div>
</template>
<style scoped>
.field { display: flex; flex-direction: column; gap: 6px; }
.lbl { font: 600 13px/1 Inter; color: var(--ink-2); }
.req { color: var(--st-reject); }
.hint { margin: 0; font: 400 12.5px Inter; color: var(--ink-3); }
.err { margin: 0; font: 500 12.5px Inter; color: var(--st-reject-ink); }
</style>
