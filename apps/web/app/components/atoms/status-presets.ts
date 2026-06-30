export interface StatusPreset {
  label: string;
  variant: string; // suffixe des variables --st-*
  icon: string; // nom Lucide
}

const PRESETS: Record<string, StatusPreset> = {
  brouillon: { label: "Brouillon", variant: "draft", icon: "pencil" },
  soumis: { label: "En attente", variant: "pending", icon: "clock" },
  refuse: { label: "À corriger", variant: "reject", icon: "rotate-ccw" },
  valide: { label: "Validé", variant: "valid", icon: "shield-check" },
  facture: { label: "Facturé", variant: "invoiced", icon: "receipt" },
  regle: { label: "Réglé", variant: "paid", icon: "banknote" },
  actif: { label: "Actif", variant: "valid", icon: "check" },
  inactif: { label: "Inactif", variant: "draft", icon: "x" }
};

// Toujours libellé + icône (jamais distinguable par la seule couleur) — AD-20.
export function statusPreset(code: string): StatusPreset {
  return PRESETS[code] ?? { label: code, variant: "draft", icon: "pencil" };
}
