# Déploiement o2switch (mutualisé cPanel / Passenger)

Deux applications Node distinctes (AD-1) :

| App | Application root | Startup file | Domaine |
|-----|------------------|--------------|---------|
| API NestJS | `~/api` | `app.js` (→ `dist/main.js`) | sous-domaine non public, gardé par credential BFF (AD-14) |
| Web Nuxt (BFF) | `~/web` | `.output/server/index.mjs` | domaine public |

**Principes**
- Build en CI (jamais sur le mutualisé — risque OOM). Artefacts poussés par `rsync` (voir `.github/workflows/deploy.yml`).
- `pnpm/npm install` lourd : via vrai client SSH, pas le terminal cPanel.
- **Migrations jouées à l'étape de déploiement** (`mikro-orm migration:up`), jamais au boot (AD-18).
- Redémarrage : `touch tmp/restart.txt` dans chaque application root.
- Secrets (JWT/session/DB/Brevo) en variables d'environnement de l'app Node cPanel — jamais dans le repo.
- Sauvegarde : JetBackup o2switch + `scripts/backup.sh` (dump MariaDB + fichiers), répliqués hors o2switch (AD-24).
