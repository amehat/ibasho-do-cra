export interface NavItem {
  label: string;
  to: string;
  icon: string;
  requiresOwner?: boolean;
}

const ALL_ITEMS: NavItem[] = [
  { label: "Tableau de bord", to: "/", icon: "layout-dashboard" },
  { label: "Nouvelle organisation", to: "/organisation/nouvelle", icon: "plus-circle" },
  { label: "Membres", to: "/organisation/membres", icon: "users", requiresOwner: true }
];

// Cloisonnement de navigation (AD-10) : « Membres » réservé aux propriétaires.
export function navItemsForRoles(roles: string[]): NavItem[] {
  const isOwner = roles.includes("owner");
  return ALL_ITEMS.filter((i) => !i.requiresOwner || isOwner);
}
