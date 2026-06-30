// Rôles d'appartenance à une organisation (cumulables, FR4).
// owner : gère les membres (les deux côtés). prestataire : orga prestataire. valideur/payeur : orga cliente.
// Les désignations PAR PROJET (le valideur d'un projet donné, etc.) arrivent à l'Epic 2.
export enum Role {
  OWNER = "owner",
  PRESTATAIRE = "prestataire",
  VALIDEUR = "valideur",
  PAYEUR = "payeur"
}
