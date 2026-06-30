<script setup lang="ts">
defineProps<{ text: string }>();
</script>
<template>
  <span class="tip"><slot /><span class="bubble" role="tooltip">{{ text }}</span></span>
</template>
<style scoped>
.tip { position: relative; display: inline-flex; }
.bubble { position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%); background: var(--shell); color: #fff; padding: 4px 8px; border-radius: 6px; font: 500 12px Inter; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 150ms ease-out; }
.tip:hover .bubble, .tip:focus-within .bubble { opacity: 1; }
</style>
