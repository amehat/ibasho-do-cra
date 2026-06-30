<template>
  <div class="bar"><slot /></div>
</template>
<style scoped>
.bar { display: flex; align-items: center; gap: var(--s-3); flex-wrap: wrap; }
</style>
