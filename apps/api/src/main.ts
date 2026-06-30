import "reflect-metadata";
import { config as loadEnv } from "dotenv";
import { resolve as resolvePath } from "node:path";
loadEnv({ path: resolvePath(__dirname, "../.env") }); // apps/api/.env, quel que soit le cwd
import { NestFactory } from "@nestjs/core";
import {Logger, ValidationPipe} from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

// API NestJS non publique derrière le BFF Nuxt (AD-1). Passenger intercepte listen() (socket Unix).
async function bootstrap(): Promise<void> {
  const secret = process.env.BFF_SHARED_SECRET;
  const port = Number(process.env.PORT ?? 3001);
  const WEAK_SECRETS = new Set(["change_me_dev_only", "dev-bff-secret-change-in-prod"]);
  if (process.env.NODE_ENV === "production" && (!secret || WEAK_SECRETS.has(secret) || secret.length < 16)) {
    throw new Error("BFF_SHARED_SECRET doit être défini, != valeur d'exemple, et >= 16 caractères en production (AD-14).");
  }
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true })); // validation au bord (AD-13)
  const doc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle("CRA API").setDescription("API interne — gardée par credential BFF").setVersion("0.0.1").build()
  );
  SwaggerModule.setup("docs", app, doc);
  await app.listen(port, () => {
    Logger.log("App is running on port " + port);
  });
}
void bootstrap();
