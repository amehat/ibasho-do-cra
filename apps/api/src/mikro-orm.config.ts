import { defineConfig } from "@mikro-orm/mariadb";
import { Migrator } from "@mikro-orm/migrations";
import { HealthCheck } from "./shared-kernel/persistence/health-check.entity";

// Connexion paresseuse (connect:false) : compatible cold-start Passenger et émission OpenAPI sans BDD.
// Les migrations sont jouées explicitement au déploiement, jamais au boot (AD-18).
export default defineConfig({
  entities: [HealthCheck],
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3306),
  dbName: process.env.DB_NAME ?? "cra",
  user: process.env.DB_USER ?? "cra",
  password: process.env.DB_PASSWORD ?? "",
  connect: false,
  extensions: [Migrator],
  migrations: { path: "./dist/migrations", pathTs: "./src/migrations", disableForeignKeys: false }
});
