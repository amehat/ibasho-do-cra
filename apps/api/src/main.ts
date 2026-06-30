import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

// API NestJS non publique derrière le BFF Nuxt (AD-1). Passenger intercepte listen() (socket Unix).
async function bootstrap(): Promise<void> {
  const secret = process.env.BFF_SHARED_SECRET;
  if (process.env.NODE_ENV === "production" && (!secret || secret === "change_me_dev_only")) {
    throw new Error("BFF_SHARED_SECRET doit être défini et != valeur d'exemple en production (AD-14).");
  }
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true })); // validation au bord (AD-13)
  const doc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle("CRA API").setDescription("API interne — gardée par credential BFF").setVersion("0.0.1").build()
  );
  SwaggerModule.setup("docs", app, doc);
  await app.listen(Number(process.env.PORT ?? 3001));
}
void bootstrap();
