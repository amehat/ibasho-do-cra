---
name: 'Revue adversariale — Architecture Spine CRA'
type: architecture-review
method: adversarial-spine-attack
target: '../ARCHITECTURE-SPINE.md'
reviewer: 'Relecteur adversaire (deux unités un niveau en dessous)'
created: '2026-06-29'
status: draft
---

# Revue adversariale — ARCHITECTURE-SPINE.md (Gestionnaire de CRA)

## Méthode

Pour chaque invariant, j'ai instancié **deux unités un niveau en dessous** (deux modules
NestJS, ou front vs back, ou deux développeurs sur deux contextes bornés) qui obéissent à la
**lettre** de chaque AD mais construisent quand même de façon **incompatible**. Je cherche :
formes de données partagées qui clashent, deux propriétaires d'une même entité, chemins de
mutation concurrents, garanties transactionnelles divergentes. Chaque paire trouvée = un trou
à combler par un AD nouveau ou resserré.

**Verdict global :** la colonne hexagonale est solide sur les dépendances et l'étanchéité des
contextes, mais elle laisse **non spécifiées les FORMES de données partagées et la PROPRIÉTÉ
des faits qui traversent les contextes**. Cinq trous sont structurels (HAUTE/MOYENNE-HAUTE)
et permettent à deux unités conformes de diverger silencieusement, dont au moins un avec
risque de fuite inter-organisations et un avec risque de statut métier incohérent au tableau
de bord.

---

## TROU #1 — Le scoping multi-org d'un CRA partagé n'a pas de clé canonique (AD-10, AD-14) — **HAUTE**

### Les deux unités
- **Module `cra`, développeur A** lit AD-10 (« aucune requête ne franchit une frontière
  organisation sans vérification explicite ») et AD-14 (le JWT porte **un** `orgId`). Il scope
  toutes ses requêtes CRA par `where org_id = actor.orgId`. **Conforme à la lettre.**
- **Module `projects` / `invoicing`, développeur B** observe que, dans le modèle de données,
  `ORGANISATION ||--o{ PROJET : "prestataire/cliente"` : un même PROJET (donc un même CRA) est
  rattaché à **deux** organisations — l'org prestataire ET l'org cliente. Il scope par
  **appartenance au projet**, pas par égalité d'org. **Conforme à la lettre aussi.**

### Le scénario de divergence
Le produit EST « prestataire en direct avec son client » : le valideur (côté payeur) et le
prestataire sont dans **deux organisations différentes** mais doivent voir **le même CRA**.

- Avec la règle de A (`org_id = actor.orgId`), le valideur de l'org cliente reçoit **404 sur un
  CRA qu'il doit valider** — fonctionnalité cassée. Ou, pire, si A scope par l'org *propriétaire
  du projet* sans vérifier que l'acteur en est membre, un acteur de **n'importe quelle** org
  partageant ce projet voit le CRA → **fuite inter-org**, exactement ce qu'AD-10 prétend
  empêcher.
- `orgId` est **singulier** dans le contrat d'acteur, mais `USER ||--o{ MEMBERSHIP` est
  **multi-org**. Pour un utilisateur multi-org, quel `orgId` est « actif » dans le JWT ? Le BFF
  doit en choisir un. Deux requêtes du même user, l'une scopée par `actor.orgId` (l'org active),
  l'autre par la relation projet, donnent des **ensembles de lignes différents**.

AD-10 dit « vérification explicite de portée via le port de politique » mais **ne définit pas
ce qu'est la portée** pour une entité co-détenue par deux orgs. La portée correcte ici n'est PAS
`org = actor.orgId` ; c'est « l'acteur a un rôle sur CE projet » (prestataire OU payeur). Tant
que cette clé n'est pas imposée, deux modules conformes scopent différemment et l'un des deux
fuit ou cache.

### Sévérité — HAUTE (sécurité + fonctionnel cœur)

### AD à resserrer / créer
**AD-10-bis — Portée par appartenance au projet, pas par égalité d'organisation.**
La frontière d'autorisation d'une entité rattachée à un projet (`CRA`, `Facture`, `Règlement`,
`Tjm`) est **« l'acteur possède un rôle sur ce projet »**, résolue par le port de politique, et
**jamais** un simple `org_id = actor.orgId`. Le port de politique expose une primitive unique
`assertProjectAccess(actor, projetId, action)` que **tous** les use-cases mutateurs ET lecteurs
appellent. Le contrat d'acteur clarifie que `orgId` désigne l'**organisation active** d'une
session multi-org et n'est **jamais** utilisé seul comme prédicat de scoping de ressource projet.

---

## TROU #2 — Propriété du statut post-validation éclatée sur 3 contextes vs source unique revendiquée (AD-7, AD-20, AD-3) — **HAUTE**

### Les deux unités
- **Module `cra`** lit AD-7 (« machine à états **possédée par l'agrégat CRA** ») + AD-20 (« le
  statut du CRA est la **source de vérité**, le front le reflète ») + le diagramme d'états qui
  inclut `Validé → Facturé → Réglé → ReçuConfirmé`. Il conclut : l'agrégat CRA porte un champ
  `statut` canonique couvrant **toute** la chaîne, jusqu'à `ReçuConfirmé`.
- **Module `invoicing`** (AD-15, propriétaire de la facture) et **`settlement`** (AD-3, FR27-29,
  propriétaire du règlement) lisent AD-3 : « un contexte n'accède **jamais** au repo d'un autre ;
  il consomme via port ou événement ». Donc Invoicing **ne peut pas** écrire le `statut` de
  l'agrégat CRA. Le fait « facturé » vit dans `invoicing` ; le fait « réglé » vit dans
  `settlement`.

### Le scénario de divergence
Le statut affiché au tableau de bord (FR31, le « chiffre clé et statut d'abord » du mantra) est
**réparti sur trois agrégats dans trois contextes** :
- `cra.statut ∈ {Brouillon, Soumis, Validé}` (ce que CRA peut réellement posséder),
- l'existence d'une `Facture` dans `invoicing`,
- l'existence/état d'un `Règlement` dans `settlement`.

Deux implémentations conformes, incompatibles :
1. **CRA porte le statut complet** : alors Invoicing/Settlement doivent le faire avancer — mais
   AD-3 leur interdit d'écrire CRA. Ils émettent `FactureDéposée` ; un abonné dans `cra`
   transitionne l'agrégat **après commit** → fenêtre de **cohérence éventuelle** où la facture
   existe mais `cra.statut = Validé`. Le tableau de bord affiche « Validé » alors que la facture
   est déposée. AD-20 (« source de vérité, jamais divergent ») est violé pendant cette fenêtre,
   et de façon permanente si l'abonné échoue (cf. Trou #4, perte après-commit).
2. **Le statut est composé à la lecture** (jointure CRA + facture + règlement) : alors le statut
   n'est **pas** « la machine à états du domaine CRA » — AD-20 et AD-7 sont contredits, et **deux
   pages** (dashboard vs détail CRA) peuvent composer la jointure différemment (ordre de
   priorité Facturé vs Réglé, gestion d'une facture remplacée AD-15) → **deux statuts pour le
   même CRA**.

AD-7 borne explicitement ses `Binds` à **FR12-19 + FR33** (jusqu'à la validation) et
**n'inclut pas** FR23-29. Donc personne ne possède officiellement les transitions
`Validé→Facturé→Réglé→ReçuConfirmé` ni le statut composite que le dashboard doit afficher.

### Sévérité — HAUTE (cohérence du chiffre/statut « d'abord », cœur du mantra produit)

### AD à créer
**AD-21 — Statut métier = projection explicite et possédée, pas champ fantôme.**
Distinguer deux notions : (a) le **statut de cycle de vie CRA** `∈ {Brouillon, Soumis, Validé}`,
seul possédé par l'agrégat CRA (AD-7) ; (b) le **statut métier composite** affiché
(`…/Facturé/Réglé/ReçuConfirmé`), défini comme une **projection en lecture** dont la **fonction
de composition est unique, possédée par un seul contexte** (p. ex. une vue `cra` alimentée par
les événements `FactureDéposée`/`RèglementConfirmé`). Cette fonction de priorité
(quel fait l'emporte, comment une facture remplacée se reflète) est spécifiée **une seule fois**
et exposée par **un seul port de lecture**, consommé identiquement par le dashboard et la page
détail. Aucun front ne recompose le statut composite.

---

## TROU #3 — Résolution des rôles-par-projet : le BFF mince forge un JWT qui porte de l'autorisation (AD-1 vs AD-14) — **HAUTE**

### Les deux unités
- **BFF Nuxt/Nitro** (AD-1 : « proxy **mince**, il **ne reshape pas** les données métier »)
  doit néanmoins, selon AD-14, forger un JWT court portant `{ userId, orgId, rôles-par-projet }`.
  Or les **rôles-par-projet sont une donnée métier** possédée par `iam`/`projects` (MEMBERSHIP,
  `INVITATION : "qualifie"`). Pour les mettre dans le JWT, le BFF doit soit les **calculer/
  reshaper** (interdit par AD-1), soit appeler IAM et **figer un instantané d'autorisation**
  dans le token.
- **Module `cra`/`projects`, couche application** (AD-9 : autorisation via port de politique ;
  AD-10 : scoping explicite) résout l'autorisation. Mais résout-il les rôles **depuis le JWT**
  (claim figé par le BFF) ou **frais depuis IAM** à chaque requête ?

### Le scénario de divergence
- Si le **port de politique fait confiance au claim `rôles-par-projet` du JWT** et qu'un admin
  révoque un rôle (FR3 désactivation, AD-11) pendant la durée de vie du token, NestJS autorise
  sur des rôles **périmés** → **fenêtre d'escalade de privilèges** (un ex-valideur valide encore).
- Si **un** module lit les rôles dans le JWT et **un autre** les ré-résout via un port IAM frais,
  deux use-cases prennent des **décisions d'autorisation divergentes** sur la même requête (l'un
  autorise, l'autre refuse). AD-9 nomme « un port de politique » mais **ne dit pas où vit la
  vérité des rôles ni sa fraîcheur**.
- Contradiction directe : AD-1 (« le BFF ne reshape pas les données métier ») vs AD-14 (« le BFF
  forge un JWT portant les rôles-par-projet »). Mettre des rôles dans le token EST du reshape
  métier. Deux développeurs lèvent la contradiction dans deux sens opposés.

### Sévérité — HAUTE (sécurité, cohérence d'autorisation)

### AD à resserrer / créer
**AD-9-bis / AD-14-bis — Source unique et fraîcheur de la résolution des rôles.**
Le JWT BFF→NestJS porte **uniquement l'identité authentifiée** (`userId`, `orgId actif`,
empreinte de session) — **pas** de rôles métier. La **résolution des rôles-par-projet est
toujours faite côté NestJS**, fraîche, par le port de politique adossé à `iam` (qui en est seul
propriétaire). Si on conserve un claim de rôles pour la perf, son TTL est explicitement borné et
documenté comme **fenêtre d'escalade acceptée**, et la révocation (AD-11) invalide la session.
Cela aligne AD-1 (le BFF reste mince : il transporte une identité, pas de l'autorisation).

---

## TROU #4 — Notifications après-commit sur bus in-process : perte silencieuse + double-envoi (AD-4, AD-5) — **MOYENNE-HAUTE**

### Les deux unités
- **Abonné `audit`** : synchrone, **même transaction** (AD-5). Garanti atomique. OK.
- **Abonné `notifications`** : « **après commit**, best-effort **retriable** » (AD-5), sur un
  **bus in-process** (AD-4).

### Le scénario de divergence
1. **Perte silencieuse.** Après commit de `CraValidé`, le bus in-process appelle l'abonné
   Notifications. Si le process Passenger redémarre/crash entre le commit et l'envoi (ou si tous
   les retries échouent : Brevo down), **l'événement est perdu** — aucun stockage durable, aucun
   rejeu possible (bus in-process, pas d'outbox). Le prestataire n'est **jamais** notifié que son
   CRA est validé, alors que l'audit, lui, a bien tracé. **Divergence permanente entre le fait
   métier (validé, audité) et la notification (jamais partie), sans trace de l'échec.**
2. **Double-envoi.** « Retriable » implique des retries ; sans **clé d'idempotence** sur
   l'événement (AD-4 dit « payload = identifiants + données minimales » mais **n'impose pas un ID
   d'événement ni une consommation idempotente »), un retry après un envoi réussi-mais-non-acquitté
   envoie **deux emails** pour la même validation.
3. **Ordre.** Plusieurs événements émis dans une même UoW : AD-4/AD-5 ne spécifient **pas** l'ordre
   de livraison. L'audit (qui dépend de l'ordre causal pour la valeur probante) peut enregistrer
   dans un ordre non déterministe.

### Sévérité — MOYENNE-HAUTE (notification = engagement produit FR30 ; silencieux = non
diagnosticable)

### AD à créer
**AD-22 — Outbox transactionnel + idempotence pour les abonnés après-commit.**
Tout événement destiné à un abonné après-commit (Notifications) est **persisté dans une table
outbox au sein de la même transaction** que le changement d'état (comme l'audit), puis dépilé par
un relai après commit. Chaque événement porte un **`eventId` (UUID v7) + version**, et la
consommation est **idempotente** (clé de dédup côté Notifications). Le relai est **rejouable**
(au boot ou via tâche planifiée) — ce qui ne contredit pas AD-18 (pas de migration au boot),
c'est une reprise de file. L'ordre de livraison intra-UoW est l'**ordre d'émission**.

---

## TROU #5 — Arrondi des montants et forme du snapshot : CRA, PDF et facture peuvent diverger (AD-6, AD-8, AD-17) — **MOYENNE-HAUTE**

### Les deux unités
- **Module `cra`** calcule le total : `Σ jours (TJM_résolu × fraction_jour)`. Les CRA ont des
  **demi-journées** (`LIGNE_JOUR` fractionnaire). `TJM` est en **centiers entiers** (AD-17).
  `33_333 cts × 0,5 = 16_666,5` → arrondi **non spécifié** (half-up ? half-even ?). Et l'ordre :
  **arrondir chaque ligne puis sommer** vs **sommer puis arrondir** donne des totaux différents.
- **Module `documents`** (AD-16 : « le **PDF du CRA est généré à la validation** ») rend le
  tableau ligne-à-ligne du PDF figé. S'il **recompute** les lignes à partdu snapshot pour les
  afficher, son arrondi peut ne **pas** sommer au `montant total` stocké.
- **Module `invoicing`** : la facture (PDF déposé externe, AD-15) porte un montant saisi par le
  prestataire ; rien ne garantit qu'il **égale** le total CRA validé (aucun invariant de
  rapprochement).

### Le scénario de divergence
AD-17 garantit « jamais de flottant » mais **ne fixe ni le mode d'arrondi, ni l'ordre
(ligne vs agrégat), ni l'unité monétaire (devise)**, et **autorise DEUX représentations**
(« entiers centimes » **OU** VO `Money` décimal) — deux contextes peuvent en choisir des
différentes, qui clashent sur le fil (payload d'événement, snapshot).

AD-8 décrit le snapshot en prose — « (montant total, TJM appliqués, jours) » — **sans schéma**.
Ambiguïtés exploitables :
- « TJM **appliqués** » : un par **plage** ou un par **jour** ? Si par plage et qu'un jour a une
  fraction, le détail n'est pas reconstituable → `documents` recompute et diverge.
- Le snapshot **copie-t-il** les lignes (auto-contenu) ou **référence-t-il** les `LIGNE_JOUR`
  vivants ? AD-8 dit « immuable » mais l'absence de méthode de réouverture protège l'**agrégat**,
  pas forcément les **lignes en base**. Deux devs : l'un fait un snapshot auto-contenu, l'autre
  pointe les lignes vivantes → une migration/bug touchant `LIGNE_JOUR` altère le sens du snapshot
  « figé ».

Résultat : **trois montants pour le même CRA** (affichage CRA, total du PDF figé, facture
déposée), tous « conformes » à AD-17/AD-8.

### Sévérité — MOYENNE-HAUTE (contexte juridique/financier ; un écart d'1 centime sur un
document signé est un défaut probant)

### AD à resserrer / créer
**AD-17-bis + AD-8-bis — Politique d'arrondi unique et snapshot auto-contenu schématisé.**
- **Une seule représentation canonique** de stockage et de transport : entiers **centimes EUR**
  (le VO `Money` est l'enveloppe typée de ces centimes, devise **EUR explicite** en v1).
- **Règle d'arrondi unique** : arrondi **par ligne** (`round(TJM × fraction)` en half-up — à
  fixer), total = **somme des lignes déjà arrondies** (jamais l'inverse), définie **une seule
  fois** dans le `shared-kernel` et utilisée par CRA et `documents`.
- **Le snapshot est un Value Object auto-contenu et schématisé** : `{ totalCents, devise,
  lignes: [{ date, fraction, tjmCents, montantLigneCents }], validéLe (UTC), valideur }`. Il
  **copie** les données (ne référence pas les lignes vivantes). `documents` **n'a le droit que de
  lire et rendre** ce VO — jamais de recomputer.
- `invoicing` : invariant de **rapprochement** facture↔total CRA validé (égalité ou écart
  justifié explicitement), sinon la facture « transmise » peut contredire l'engagement signé.

---

## Trous secondaires (MOYENNE / à surveiller)

### S-1 — Dérive de l'enveloppe d'erreur malgré le client généré (AD-12, AD-13) — MOYENNE
AD-12 génère un client TS depuis l'OpenAPI des **DTO de succès**. Mais l'enveloppe
`{ error: { code, message, details? } }` et l'**enum `code`** (Consistency Conventions) ne sont
**pas** typiquement dérivés des DTO → le mapping front du `code` est **synchronisé à la main**.
Le back ajoute un code, l'enum front est périmé → l'UI tombe en générique ou mappe à côté
(AD-20 : « code stable mappé par l'UI, jamais de parsing de texte » — mais rien n'empêche le
drift de l'enum). De plus, AD-13 produit **deux formes d'erreur** : la validation structurelle
class-validator (400 par défaut de Nest) **vs** l'enveloppe custom du domaine — le client en voit
**deux**. **AD à resserrer :** l'enum de codes d'erreur ET l'enveloppe sont un artefact **généré/
validé** de `packages/contracts` (test de drift au pipeline) ; un filtre d'exception Nest
**uniformise** la sortie class-validator dans l'enveloppe `{ error: { code … } }`.

### S-2 — Le client généré cible NestJS mais le front n'appelle que le BFF (AD-12 vs AD-1/AD-19) — MOYENNE
AD-12 : « le front appelle l'API uniquement via le client généré ». AD-19 : « aucun composant
n'appelle NestJS directement ». Le client généré est typé sur **NestJS**, mais les URL réelles
sont les **server routes Nitro**. Si le BFF ne **repasse pas verbatim** statut HTTP + enveloppe
d'erreur, le client généré gère mal les erreurs. **AD à resserrer :** base-URL du client généré =
le BFF ; le BFF est tenu de **passer statut et enveloppe d'erreur à l'identique** (ce qui renforce
AD-1 « ne reshape pas »).

### S-3 — Localisation du verrou optimiste : domaine pur vs `@Version` ORM (AD-7 vs AD-2) — MOYENNE
AD-7 : « première validation gagne, verrou **optimiste** sur la **version de l'agrégat** » — c'est
un **invariant de domaine**. AD-2/Consistency : **aucun décorateur ORM sur le domaine**, modèles
de persistance séparés + mappers. Où vit `version` ? Si elle reste infra (`@Version` MikroORM), le
domaine ne peut **pas** porter la règle « première gagne » ; si elle est dans le domaine, le mapper
doit la transporter fidèlement. Deux devs résolvent dans deux sens → l'un n'applique pas réellement
le verrou. **AD à resserrer :** `version` est un **attribut du domaine** (entier), mappé 1:1 vers le
champ optimiste ORM ; le mapper est tenu de le propager dans les deux sens.

### S-4 — PDF généré sur la branche perdante d'une double-validation (AD-7, AD-16) — MOYENNE
Deux validations concurrentes : le perdant échoue au commit (verrou optimiste). Si la **génération
PDF (`documents`) est inline dans le use-case** (avant commit), le perdant a déjà produit un PDF
(orphelin, collision de nom possible). **AD à resserrer :** la génération PDF est déclenchée par
l'**événement `CraValidé` committé** (post-commit, via outbox AD-22), jamais inline — un seul commit
gagnant ⇒ un seul PDF. Le perdant reçoit un **code d'erreur métier explicite** « déjà validé par X »,
pas un « conflit de concurrence » générique.

### S-5 — Unicité de la période CRA par projet — MOYENNE
`PROJET ||--o{ CRA : "période"` : rien dans les AD n'interdit **deux CRA pour le même mois/projet**
→ risque de **double facturation**. **AD à créer :** invariant d'unicité `(projetId, période)` côté
`cra`, garanti en base (contrainte) ET en domaine.

### S-6 — Jours fériés calculés des deux côtés (Consistency « date-holidays ») — FAIBLE
Logique fériés dans `cra` (autorité), mais si le front recalcule pour l'affichage avec une autre
version de lib, l'UX marque un jour férié que le back ignore. AD-20 cadre le **statut**, pas les
fériés. **À surveiller :** le front **reflète** le marquage férié renvoyé par le back, ne le
recompute pas.

---

## Synthèse des AD proposés

| # | Trou | Sévérité | AD proposé |
| --- | --- | --- | --- |
| 1 | Scoping multi-org d'un CRA co-détenu (org presta vs org cliente) | HAUTE | AD-10-bis — portée par appartenance projet, `assertProjectAccess`, `orgId`=org active |
| 2 | Propriété du statut post-validation éclatée sur 3 contextes vs source unique | HAUTE | AD-21 — distinguer cycle de vie CRA vs statut composite = projection unique possédée |
| 3 | BFF mince forge un JWT porteur de rôles ; fraîcheur/source des rôles floue | HAUTE | AD-9-bis/14-bis — rôles résolus frais côté NestJS, JWT = identité seule |
| 4 | Notifications après-commit in-process : perte silencieuse + double-envoi | MOY-HAUTE | AD-22 — outbox transactionnel + eventId/idempotence + rejeu + ordre d'émission |
| 5 | Arrondi non spécifié + forme du snapshot non schématisée → 3 montants | MOY-HAUTE | AD-17-bis/8-bis — centimes EUR unique, arrondi par ligne, snapshot VO auto-contenu |
| S-1 | Drift enum d'erreur + double forme d'erreur | MOYENNE | enveloppe+enum générés/validés au pipeline ; filtre Nest uniformisant |
| S-2 | Client généré (NestJS) vs front→BFF only | MOYENNE | base-URL=BFF ; passthrough verbatim statut+erreur |
| S-3 | `version` optimiste : domaine vs ORM | MOYENNE | `version` attribut domaine, mappé 1:1 |
| S-4 | PDF généré sur la branche perdante | MOYENNE | PDF déclenché par événement committé, pas inline |
| S-5 | Unicité période CRA par projet absente | MOYENNE | invariant `(projetId, période)` base + domaine |
| S-6 | Fériés recalculés côté front | FAIBLE | front reflète le marquage back |

**Conclusion.** L'épine maîtrise *la direction des dépendances* et *l'étanchéité des contextes*,
mais sous-spécifie *la forme des données partagées* et *la propriété des faits transverses*. Les
trous 1 à 5 sont les plus dangereux car deux unités strictement conformes y divergent — avec, en
tête, une **fuite/blocage inter-organisations** (Trou #1) et un **statut métier incohérent au
tableau de bord** (Trou #2), tous deux frappant le cœur du mantra produit « simple, avec une vue
rapide ».
