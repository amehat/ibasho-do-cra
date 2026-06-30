import { defineStore } from "pinia";
import type { HealthResponse } from "@cra/contracts";

// État client = Pinia (AD-19). Le composant ne fetch que via les routes BFF.
export const useHealthStore = defineStore("health", {
  state: () => ({ health: null as HealthResponse | null }),
  actions: {
    async refresh() {
      this.health = await $fetch<HealthResponse>("/api/health");
    }
  }
});
