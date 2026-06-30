# Revue de vérification — versions & réalité technique

**Fichier relu :** `ARCHITECTURE-SPINE.md`
**Date de la revue :** 2026-06-29
**Méthode :** chaque décision technique engagée dans la spine a été confrontée au web (WebSearch / WebFetch), et non affirmée de mémoire.

---

## Verdict

**La spine est techniquement saine et globalement à jour.** Toutes les technologies nommées existent en juin 2026, sont maintenues, et conviennent à l'hébergement o2switch (mutualisé cPanel / Passenger). Aucun finding bloquant. Quelques notes de fraîcheur mineures (cycle de vie de Node 22, existence de pdfmake 0.3.x, GA de MikroORM v7 et Brevo SDK v6) à arbitrer consciemment.

---

## Tableau de synthèse des vérifications

| Élément (spine) | Affirmé | Réalité (juin 2026) | Statut |
| --- | --- | --- | --- |
| Nuxt | 4.4.x | 4.4 sorti mars 2026, patches jusqu'à 4.4.4 ; Nuxt 3 EOL 31 juil. 2026 | ✅ Exact |
| NestJS | 11.1.x | 11.1.27 (15 juin 2026) ; requiert Node ≥ 20 | ✅ Exact |
| MikroORM | 6.6.x (v7 écartée) | v6.6.14 = dernier v6 maintenu ; v7.0.14 = GA | ✅ Exact (note v7) |
| Turborepo | 2.10.x | 2.10.0 publié ~4 jours avant | ✅ Exact |
| Node.js | 22 LTS | 22 en **Maintenance** LTS (EOL 30 avr. 2027) ; 24 = Active LTS | ⚠️ Exact mais à arbitrer |
| TypeScript | 5.x | 5.x courant | ✅ Exact |
| pdfmake | 0.2.x | 0.2.20 (dernier 0.2.x) ; **0.3.11 existe** | ⚠️ Ligne dépassée |
| MariaDB | ≥ 10.6 (o2switch) | o2switch ≈ 10.6 | ✅ Exact |
| PostgreSQL o2switch | déconseillé / non garanti | **Dépréciation confirmée** par la FAQ o2switch | ✅ Confirmé |
| Node.js sur o2switch | supporté (Passenger) | Versions 6→24 dont 22 et 24, via Phusion Passenger | ✅ Confirmé |
| `date-holidays` | jours fériés FR | Maintenu (maj mai 2026), supporte FR | ✅ Confirmé |
| `@getbrevo/brevo` | SDK Brevo courant | SDK officiel courant ; 5.0.4 actuel, v6.0 dispo | ✅ Confirmé (note v6) |
| argon2id | recommandé | Recommandation n°1 OWASP en 2026 | ✅ Confirmé |

---

## Findings détaillés

### F1 — Node 22 est passé en Maintenance LTS — [SÉVÉRITÉ : FAIBLE-MOYENNE]
**Constat.** La spine fixe « Node.js 22 LTS ». En juin 2026, Node 22 n'est plus en *Active LTS* mais en **Maintenance LTS** depuis le 21 octobre 2025, avec **fin de vie le 30 avril 2027**. Node 24 est la ligne *Active LTS* (EOL 30 avr. 2028). o2switch propose 22 **et** 24 (confirmé).
**Impact.** Le projet démarrant mi-2026, choisir Node 22 donne une fenêtre de support EOL de seulement ~10 mois ; une migration vers 24 sera nécessaire dès Q1 2027.
**Correctif.** Adopter **Node 24 LTS** comme cible (déjà disponible chez o2switch et supporté par NestJS 11 et Nuxt 4) pour gagner ~12 mois de support et éviter une migration précoce. À défaut, documenter explicitement la migration 22→24 planifiée avant avril 2027.
**Source.** endoflife.date/nodejs ; nodejs.org/en/about/previous-releases ; faq.o2switch.fr (guide Node.js multi-version : versions 6→24 dont 22 et 24).

### F2 — pdfmake : la ligne 0.2.x n'est plus la ligne courante — [SÉVÉRITÉ : FAIBLE]
**Constat.** La spine pin `pdfmake 0.2.x`. La dernière 0.2.x est **0.2.20** (il y a ~6 mois), mais une nouvelle ligne **0.3.x existe désormais (0.3.11, publiée il y a ~12 jours)**. Le paquet reste sain et activement maintenu (~2 M téléchargements/sem).
**Impact.** Aucun risque immédiat — 0.2.x fonctionne et est pure-JS (adapté à Passenger). Mais épingler une ligne mineure désormais antérieure peut figer des correctifs/sécurité à venir portés sur 0.3.x.
**Correctif.** Évaluer **pdfmake 0.3.x** au démarrage (vérifier le changelog 0.2→0.3 pour breaking changes) ; sinon, conserver 0.2.x consciemment et noter que 0.3.x est la ligne active. Le fallback `pdf-lib` mentionné reste valide.
**Source.** npmjs.com/package/pdfmake (versions) ; security.snyk.io/package/npm/pdfmake (maintenance « Healthy »).

### F3 — MikroORM v7 est en GA, pas en beta — [SÉVÉRITÉ : INFORMATIF]
**Constat.** La spine écarte v7 « pour stabilité » et reste en 6.6.x. C'est un choix défendable, mais il faut noter que **v7 est sorti en version stable (GA)** (« MikroORM 7: Unchained », v7.0.14 dispo), avec zéro dépendance runtime du core, ESM natif et découplage Node. v6.6.x (6.6.14) reste maintenu en parallèle.
**Impact.** Aucun — le choix v6.6.x est cohérent et sûr pour v1. Simplement, le motif « écartée pour stabilité » sous-entend une immaturité qui n'est plus tout à fait exacte : v7 est GA, pas expérimentale. La justification réelle = éviter une migration majeure (knex→zéro-dep, ESM) en plein démarrage v1, ce qui reste valable.
**Correctif.** Reformuler la note de la spine en « v7 GA disponible ; migration majeure (ESM natif, suppression knex) différée après stabilisation v1 » — déjà cohérent avec la section *Deferred*. Vérifier au moment du choix que le **driver MariaDB** est bien couvert en 6.6.x (il l'est).
**Source.** mikro-orm.io/blog/mikro-orm-7-released ; mikro-orm.io/docs/upgrading-v6-to-v7 ; github releases (6.6.14 / 7.0.14).

### F4 — Brevo SDK : v6 disponible avec breaking changes — [SÉVÉRITÉ : INFORMATIF]
**Constat.** La spine nomme `@getbrevo/brevo` sans épingler de version (bon réflexe). C'est bien le **SDK Node officiel courant**. Version actuelle largement déployée **5.0.4** ; une **v6.0** existe avec breaking changes (v5.x reste supporté en compat-fil).
**Impact.** Aucun. Le SDK est le bon. Au moment du `npm install`, choisir consciemment 5.x (stable, doc abondante) ou 6.x.
**Correctif.** Épingler une version majeure explicite dans le `package.json` (ex. `^5`) pour éviter qu'un `latest` ne tire un v6 à breaking changes par surprise.
**Source.** npmjs.com/package/@getbrevo/brevo ; github.com/getbrevo/brevo-node ; developers.brevo.com/guides/node-js.

### F5 — Dépréciation PostgreSQL o2switch : confirmée — [SÉVÉRITÉ : INFORMATIF — valide le choix]
**Constat.** La spine choisit MariaDB et mentionne PostgreSQL comme non garanti. **Vérification directe de la FAQ o2switch** : texte explicite — « *Il est probable que nous arrêtions de proposer les bases de données postgresql (et phppgadmin) à l'avenir* », motifs = faible usage, version ancienne **9.6** non upgradable, et l'éditeur cPanel qui envisage de retirer le support PostgreSQL.
**Impact.** Confirme et **renforce** le choix MariaDB de la spine. Aucune date ferme annoncée, mais la trajectoire est claire : ne pas miser sur PostgreSQL chez o2switch.
**Correctif.** Aucun — décision déjà correcte. Optionnel : citer cette source dans la spine pour tracer la justification.
**Source.** faq.o2switch.fr/cpanel/bases-de-donnees/postgresql/ (cité textuellement).

### F6 — Node + MariaDB + multi-app Passenger sur o2switch : faisable — [SÉVÉRITÉ : INFORMATIF]
**Constat.** L'archi déploie **deux apps Passenger** (Nuxt/Nitro public + NestJS sur sous-domaine) sur le même compte mutualisé, + MariaDB, + disque hors webroot. Vérifié : o2switch fournit l'outil cPanel « Setup Node.js App » s'appuyant sur **Phusion Passenger**, supporte plusieurs apps Node, et MariaDB (~10.6). La recommandation officielle « ne pas placer les fichiers de l'app dans le dossier du domaine » est cohérente avec l'invariant AD-16 (stockage hors webroot).
**Impact.** Le modèle de déploiement de la spine est réaliste sur o2switch. Le point d'attention connu (AD-14) — pas d'isolation réseau en mutualisé, donc frontière = secret JWT signé — reste le bon arbitrage ; déjà acté en *Deferred* (durcissement VPS plus tard).
**Correctif.** Aucun. Confirmer en phase d'exploitation que les **deux** environnements Node Passenger peuvent tourner simultanément sous les limites du compte (RAM/processus), et que MikroORM migrations en SSH (AD-18) sont possibles (SSH confirmé chez o2switch).
**Source.** faq.o2switch.fr/cpanel/logiciels/hebergement-nodejs-multi-version/ ; faq.o2switch.fr/guides/nodejs/.

### F7 — argon2id : aligné sur l'état de l'art — [SÉVÉRITÉ : INFORMATIF]
**Constat.** La spine impose argon2id (AD-14). **OWASP Password Storage Cheat Sheet** place argon2id en **tête de recommandation en 2026** (min. 19 MiB / t=2 / p=1).
**Impact.** Choix optimal. Attention pratique : en mutualisé, la RAM par process est contrainte — calibrer le coût mémoire argon2id (ex. 19–64 MiB) pour ne pas saturer sous charge.
**Correctif.** Aucun sur le principe. Préciser dans l'implémentation les paramètres argon2id (mémoire/itérations/parallélisme) en respectant le minimum OWASP tout en restant soutenable sur Passenger mutualisé.
**Source.** cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html.

### F8 — `date-holidays` : maintenu et adapté — [SÉVÉRITÉ : INFORMATIF]
**Constat.** La lib `date-holidays` (Consistency Conventions / contexte CRA) existe, est **maintenue** (mise à jour npm mai 2026), couvre la **France** et permet le multilingue (`setLanguages`). L'usage « pré-marqués mais forçables » (FR12) est compatible.
**Impact.** Choix valide. Alternative française notable : `@socialgouv/jours-feries` (plus minimaliste, FR-only) si l'on veut réduire la surface.
**Correctif.** Aucun. Vérifier au build que la version embarque bien les données jours fériés FR à jour pour l'année courante.
**Source.** npmjs.com/package/date-holidays ; github.com/SocialGouv/jours-feries (alternative).

---

## Conclusion

Aucune techno nommée n'est obsolète ou disparue ; toutes conviennent à o2switch mutualisé. Les seuls arbitrages à poser consciemment :

1. **Node 24 plutôt que 22** (F1) — recommandé pour la fenêtre de support — *seule action à valeur réelle.*
2. **pdfmake 0.3.x à évaluer** (F2) — la 0.2.x n'est plus la ligne active.
3. Épingler explicitement les majors **MikroORM 6.6** et **Brevo 5** (F3/F4) pour éviter une montée involontaire en v7/v6.

Les choix structurants (MariaDB vs PostgreSQL déprécié, argon2id, double app Passenger, frontière par secret signé en mutualisé) sont **confirmés par les sources** et bien fondés.

---

### Sources consultées
- Nuxt : github.com/nuxt/nuxt/releases ; nuxt.com/blog/v4 ; endoflife.date/nuxt
- NestJS : github.com/nestjs/nest/releases ; trilon.io/blog/announcing-nestjs-11-whats-new ; docs.nestjs.com/migration-guide
- MikroORM : mikro-orm.io/blog/mikro-orm-7-released ; mikro-orm.io/docs/upgrading-v6-to-v7 ; github.com/mikro-orm/mikro-orm/releases
- Turborepo : github.com/vercel/turborepo/releases ; npmjs.com/package/turbo
- Node.js : endoflife.date/nodejs ; nodejs.org/en/about/previous-releases ; github.com/nodejs/release
- pdfmake : npmjs.com/package/pdfmake ; security.snyk.io/package/npm/pdfmake
- date-holidays : npmjs.com/package/date-holidays ; github.com/SocialGouv/jours-feries
- Brevo : npmjs.com/package/@getbrevo/brevo ; github.com/getbrevo/brevo-node ; developers.brevo.com/guides/node-js
- argon2id : cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- o2switch Node.js : faq.o2switch.fr/cpanel/logiciels/hebergement-nodejs-multi-version/ ; faq.o2switch.fr/guides/nodejs/
- o2switch PostgreSQL (dépréciation) : faq.o2switch.fr/cpanel/bases-de-donnees/postgresql/
- o2switch MariaDB : faq.o2switch.fr/cpanel/bases-de-donnees/mysql/
