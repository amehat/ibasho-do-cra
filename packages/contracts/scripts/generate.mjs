// Génère les types du contrat depuis l'OpenAPI de l'API (AD-12). Binaire local, pas de réseau.
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";

const openapiPath = resolve(process.cwd(), "../../apps/api/openapi.json");
if (!existsSync(openapiPath)) {
  console.error("openapi.json introuvable. Lancer d'abord: pnpm --filter @cra/api emit:openapi");
  process.exit(1);
}
execSync(`pnpm exec openapi-typescript ${openapiPath} -o src/generated/schema.ts`, { stdio: "inherit" });
console.log("Types du contrat générés: src/generated/schema.ts");
