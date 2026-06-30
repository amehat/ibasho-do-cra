<template>
  <div class="auth">
    <div class="panel card">
      <div class="brand"><span class="logo">CRA</span></div>
      <slot />
    </div>
  </div>
</template>
<style scoped>
.auth { min-height: 100vh; display: grid; place-items: center; padding: var(--s-5); background: var(--canvas); }
.panel { width: 100%; max-width: 420px; padding: var(--s-6); box-shadow: var(--shadow-md); }
.brand { margin-bottom: var(--s-5); }
.logo { font: 700 22px Outfit; color: var(--ink); }
</style>
