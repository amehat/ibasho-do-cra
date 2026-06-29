import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

// API NestJS non publique derrière le BFF Nuxt (AD-1). Passenger intercepte listen() (socket Unix).
async function bootstrap(): Promise<void> {
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
