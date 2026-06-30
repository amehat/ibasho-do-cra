<script setup lang="ts">
defineProps<{ open: boolean; title: string; message?: string }>();
const emit = defineEmits<{ confirm: []; cancel: [] }>();
</script>
<template>
  <div v-if="open" class="overlay" role="dialog" aria-modal="true" @keydown.esc="emit('cancel')">
    <div class="modal card">
      <h2 class="ttl">{{ title }}</h2>
      <p v-if="message" class="msg">{{ message }}</p>
      <ActionBar style="justify-content: flex-end; margin-top: var(--s-4)">
        <BaseButton variant="secondary" @click="emit('cancel')">Annuler</BaseButton>
        <BaseButton variant="primary" @click="emit('confirm')">Confirmer</BaseButton>
      </ActionBar>
    </div>
  </div>
</template>
<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(20,23,30,.35); display: grid; place-items: center; z-index: 50; }
.modal { padding: var(--s-5); max-width: 420px; width: calc(100% - 32px); box-shadow: var(--shadow-lg); border-radius: var(--r-card); }
.ttl { margin: 0 0 8px; font: 600 20px Outfit; }
.msg { margin: 0; color: var(--ink-2); }
</style>
