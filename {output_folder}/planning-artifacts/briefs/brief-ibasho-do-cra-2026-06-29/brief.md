---
title: "Product Brief — Gestionnaire de CRA"
status: ready
created: 2026-06-29
updated: 2026-06-29
---

# Product Brief : Gestionnaire de CRA

## Résumé exécutif

Un outil web qui dématérialise toute la chaîne administrative d'une mission de prestation : du compte rendu d'activité (CRA) mensuel jusqu'à la confirmation du règlement, en passant par la facture. Aujourd'hui, un prestataire en télétravail remplit son CRA à la main, le scanne, l'envoie par mail, attend que le client l'imprime, le signe et le renvoie — puis édite sa facture et la transmet au service administratif. Ces allers-retours papier prennent **~15 jours**, alors que le délai de paiement négocié est de **7 jours** : la paperasse coûte plus cher que le délai contractuel lui-même.

Le produit remplace ce circuit par un tunnel numérique simple : saisie **au fil du mois**, validation client **en un clic**, CRA verrouillé et horodaté, puis facture et suivi du règlement jusqu'à réception. L'objectif : être payé **avant même l'échéance négociée**, et ne plus jamais imprimer ni scanner.

Première cible : un prestataire indépendant **en direct** avec son client. Le produit est conçu pour grandir ensuite vers les configurations avec intermédiaire et la gestion contractuelle complète.

## Le problème

Chaque mois, le prestataire en télétravail à 100 % vit le même circuit :

1. Il remplit son CRA **à la main**, de mémoire, en fin de mois — d'où des erreurs (un férié travaillé oublié, une demi-journée de congé mal reportée).
2. Il **scanne** et envoie par mail.
3. En cas d'erreur de jours, **échange de mails**, correction, renvoi.
4. Le client **imprime, signe, renvoie**.
5. Le prestataire édite sa **facture** et l'envoie, avec le CRA signé, au **service administratif** du client.

**Conséquences mesurées :**
- Le circuit administratif prend **~15 jours**, contre un délai de paiement négocié de **7 jours** → trésorerie décalée.
- Un **couac environ 1 mois sur 3** (erreur de jour, mail perdu) qui relance un aller-retour complet.
- La douleur est **partagée** : le service administratif du client subit aussi la paperasse et les corrections.

Le contrat suit le même schéma, en pire : de nombreux allers-retours avant signature. (Douleur réelle mais traitée plus tard — voir Périmètre.)

## La solution

Une application web où chaque acteur a son compte et son interface :

- **Saisie au fil du mois** par le prestataire : jours, demi-journées, fériés travaillés. Les erreurs sont corrigées à la source, pas découvertes en fin de circuit.
- **Validation client** : le client voit le CRA dans une vraie interface, et **valide** ou **invalide avec un message**. Le mail ne sert qu'à l'**alerter** d'une activité sur l'app — il ne reçoit pas un PDF à imprimer.
- **CRA validé = verrouillé et horodaté.** La validation cliquée par le client authentifié **vaut signature** (mention « validé électroniquement par X le … » sur le PDF généré). Seul le client signe ; la soumission du prestataire suffit de son côté. Un CRA validé est **définitivement immuable** : personne ne le déverrouille, pas même l'admin.
- **Facture déposée** (PDF) et liée au CRA validé, mise à disposition du service administratif (CRA + facture). L'outil **ne génère pas** de facture (certification requise en France) : le prestataire dépose la sienne.
- **Suivi du règlement** : date de règlement renseignée, puis **confirmation de réception** par le prestataire.
- **TJM** renseigné dès le départ → visibilité immédiate du montant facturé.

Le maître-mot, répété par l'utilisateur : **simple, avec une vue rapide.**

## Ce qui rend ça différent

À être honnête : **il n'y a pas de fossé technologique.** Des outils équivalents existent (type Boondmanager, Furious…) et les clients en connaissent déjà — ce qui, au passage, rend l'adoption crédible. L'avantage est ailleurs :

- **Positionnement.** Ces outils sont pensés *pour l'intermédiaire / l'ESN*. Le **prestataire solo en direct** est mal servi : produits indisponibles pour lui, chers ou surdimensionnés. C'est précisément ce segment qui est visé.
- **Intégration bout-en-bout.** Personne ne réunit, en un seul endroit simple, **CRA + facture + suivi du règlement** (et demain contrat + signature). C'est l'intégration, pas une fonctionnalité isolée, qui crée la valeur.
- **Projet maîtrisé.** C'est aussi un projet personnel assumé : maîtrise technique, et une porte ouverte pour devenir soi-même intermédiaire demain (d'où la future gestion de marge).

L'avantage durable, s'il y en a un, est **l'exécution et l'adéquation à une niche mal servie**, pas la technologie.

## Pour qui

- **Le prestataire (utilisateur premier).** Indépendant en télétravail, en direct avec son client. Veut saisir sans erreur, être payé vite, ne plus scanner. Succès = règlement reçu dans les temps, zéro paperasse.
- **Le client / son service administratif.** Veut valider vite, sans erreur, sans relancer. Succès = un clic pour valider ou contester, et une facture propre qui arrive directement au bon service.
- **L'intermédiaire (vision, hors v1).** Apporteur d'affaires qui ajoute sa marge entre prestataire et client, avec des règles de confidentialité des prix.
- **L'admin (propriétaire de projet).** Garant du système : configure le projet, invite et qualifie les membres, gère le paramétrage. Il ne peut **pas** modifier la validation d'un CRA.

## Critères de succès

*(Proposés à partir des éléments donnés — à valider/ajuster.)*

- **Délai fin-de-mois → règlement reçu** ramené **sous le délai contractuel négocié (≤ 7 jours)**, contre ~22 jours aujourd'hui (7 + ~15 de circuit).
- **Zéro aller-retour papier/scan/mail** pour un CRA standard.
- **Zéro erreur de jours** atteignant la facture (corrigées à la source par la saisie au fil de l'eau).
- **Adoption réelle** : le premier client utilise l'outil **≥ 3 mois consécutifs** sans revenir au papier.
- **Autonomie du client** : il valide seul depuis l'alerte mail, sans relance manuelle.

## Périmètre

**Dans la v1 — le tunnel qui doit tourner pour le premier client, en direct :**
- Création d'un projet : association prestataire/client, dates de mission, TJM.
- Saisie du CRA au fil du mois (jours, demi-journées, fériés).
- Validation / invalidation client avec message ; verrouillage du CRA validé.
- Notification mail d'alerte.
- Signature du CRA = **Option A** (validation client authentifiée + horodatée vaut signature ; PDF généré).
- Dépôt de la facture (PDF) liée au CRA validé + mise à disposition du service administratif (le client la consulte/télécharge dans l'app). Aucune génération de facture.
- Date de règlement + confirmation de réception par le prestataire.

**Hors v1 (vision — non bloquant pour le premier client) :**
- Rôle **intermédiaire** + logique de marge (%, confidentialité des prix selon les rôles).
- **Module contrat collaboratif** : rédaction par section, validation partielle/globale, export Word + PDF, **signature en ligne du contrat** (jugée « trop tôt »).
- **Synthèses / tableaux de bord** (coût, jours travaillés sur l'année…).
- **Gestion d'absence avancée** (remplaçant désigné sur une plage de dates). *(Un CRA validé reste immuable en toutes circonstances.)*

## Vision

À terme, l'outil couvre **toute la vie administrative d'une mission**, pour toutes les configurations : prestataire direct, mais aussi avec intermédiaire — avec gestion fine de la marge et de sa confidentialité (l'intermédiaire et le client voient le prix avec marge ; le prestataire ne voit que son TJM ; sans intermédiaire, prestataire et client voient le même prix). Le module contrat collaboratif fait du produit un **espace unique du premier échange à la signature finale**, avec exports Word/PDF et signature en ligne. Les synthèses transforment l'outil de simple formulaire en **tableau de bord d'activité** (revenus, jours travaillés, historique pluriannuel). Et l'utilisateur lui-même peut basculer du rôle de prestataire à celui d'intermédiaire — l'outil grandit avec son auteur.
