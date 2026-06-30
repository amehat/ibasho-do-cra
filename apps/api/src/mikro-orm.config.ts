import { defineConfig } from "@mikro-orm/mariadb";
import { Migrator } from "@mikro-orm/migrations";
import { HealthCheck } from "./shared-kernel/persistence/health-check.entity";

// Connexion paresseuse (connect:false) : compatible cold-start Passenger et émission OpenAPI sans BDD.
// Timeouts bornés : une DB injoignable retombe vite, /health ne pend pas (AD-24 liveness).
// Migrations jouées explicitement au déploiement, jamais au boot (AD-18).
export default defineConfig({
  entities: [HealthCheck],
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3306),
  dbName: process.env.DB_NAME ?? "cra",
  user: process.env.DB_USER ?? "cra",
  password: process.env.DB_PASSWORD ?? "",
  connect: false,
  pool: { acquireTimeoutMillis: 3000 },
  driverOptions: { connection: { connectTimeout: 2000 } },
  extensions: [Migrator],
  migrations: { path: "./dist/migrations", pathTs: "./src/migrations", disableForeignKeys: false }
});
