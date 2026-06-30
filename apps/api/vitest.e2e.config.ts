import { defineConfig } from "vitest/config";
import swc from "unplugin-swc";

// SWC émet les métadonnées de décorateurs (experimentalDecorators + emitDecoratorMetadata)
// -> l'injection de dépendances NestJS fonctionne en e2e (esbuild ne le ferait pas).
export default defineConfig({
  plugins: [swc.vite()],
  test: {
    environment: "node",
    include: ["test/**/*.e2e-spec.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false
  }
});
