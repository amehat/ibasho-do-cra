// Génère le client TS depuis l'OpenAPI de l'API (AD-12).
// 1) l'API émet openapi.json (`pnpm --filter @cra/api emit:openapi`)
// 2) openapi-typescript le transforme en types dans src/generated/api.ts
import { existsSync } from "node:fs";
import { resolve } from "node:path";
const openapiPath = resolve(process.cwd(), "../../apps/api/openapi.json");
if (!existsSync(openapiPath)) {
  console.error("openapi.json introuvable. Lancer d'abord: pnpm --filter @cra/api emit:openapi");
  process.exit(1);
}
const { execSync } = await import("node:child_process");
execSync(`npx openapi-typescript ${openapiPath} -o src/generated/openapi.d.ts`, { stdio: "inherit" });
console.log("Client généré: src/generated/openapi.d.ts");
