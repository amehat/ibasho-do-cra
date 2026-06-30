import "reflect-metadata";
import { writeFileSync } from "node:fs";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "../src/app.module";

// Émet openapi.json (consommé par @cra/contracts pour générer le client). AD-12.
async function emit(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: ["error", "warn"] });
  const doc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle("CRA API").setVersion("0.0.1").build()
  );
  writeFileSync("openapi.json", JSON.stringify(doc, null, 2));
  await app.close();
  console.log("openapi.json émis.");
}
emit().catch((err) => {
  console.error("ECHEC emit-openapi:", err);
  process.exit(1);
});
