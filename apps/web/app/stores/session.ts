import { defineStore } from "pinia";
import type { MyProfile } from "@cra/contracts";

// Identité + rôles résolus côté serveur (AD-14). Aucun rôle "en dur" décisif côté navigateur.
export const useSession = defineStore("session", {
  state: () => ({ profile: null as MyProfile | null, loaded: false }),
  getters: {
    isAuthenticated: (s): boolean => s.profile !== null,
    organisations: (s) => s.profile?.organisations ?? [],
    allRoles: (s): string[] => [...new Set((s.profile?.organisations ?? []).flatMap((o) => o.roles))],
    ownerOrgs: (s) => (s.profile?.organisations ?? []).filter((o) => o.roles.includes("owner"))
  },
  actions: {
    setProfile(p: MyProfile | null) {
      this.profile = p;
      this.loaded = true;
    },
    hasRole(role: string): boolean {
      return this.allRoles.includes(role);
    }
  }
});
