# Lancer le projet en local

Prérequis : Node 22+ (cible 24), pnpm 10, Docker.

```bash
pnpm install
cp apps/api/.env.example apps/api/.env     # déjà fait si .env présent
cp apps/web/.env.example apps/web/.env
pnpm db:up          # MariaDB locale (docker compose) sur :3306
pnpm db:migrate     # applique les migrations (jamais au boot — AD-18)
pnpm dev            # API NestJS sur :3001 + Nuxt (BFF) sur :3000
```

| Quoi | URL |
|------|-----|
| **Application (à tester dans le navigateur)** | http://localhost:3000 |
| Inscription | http://localhost:3000/inscription |
| Connexion | http://localhost:3000/connexion |
| API interne (Swagger) | http://localhost:3001/docs |
| API santé (publique) | http://localhost:3001/health |

> Le navigateur ne parle qu'au BFF Nuxt (:3000). L'API (:3001) est interne, gardée par le secret BFF.
> Arrêt BDD : `pnpm db:down` (les données persistent dans le volume `cra-db-data`).
