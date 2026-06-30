import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { MikroORM } from "@mikro-orm/core";
import request from "supertest";
import jwt from "jsonwebtoken";
import { AppModule } from "../src/app.module";

// e2e du tunnel auth contre une vraie MariaDB (compose en local, service en CI).
// Tables supposées migrées (pnpm db:migrate). Nettoie ses propres lignes.
const SECRET = "e2e-shared-secret-abcdef123456";
const origin = () => `Bearer ${jwt.sign({}, SECRET, { algorithm: "HS256", expiresIn: "60s" })}`;
const identity = (uid: string) => `Bearer ${jwt.sign({ sub: uid }, SECRET, { algorithm: "HS256", expiresIn: "60s" })}`;
const TEST_EMAIL = "e2e-user@e2e.test";

let app: INestApplication;
let orm: MikroORM;
let userId = "";

beforeAll(async () => {
  process.env.BFF_SHARED_SECRET = SECRET;
  const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = mod.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
  orm = app.get(MikroORM);
  await orm.em.getConnection().execute("delete from sessions where user_id in (select id from users where email = ?)", [TEST_EMAIL]);
  await orm.em.getConnection().execute("delete from users where email = ?", [TEST_EMAIL]);
}, 30000);

afterAll(async () => {
  if (orm) {
    await orm.em.getConnection().execute("delete from sessions where user_id in (select id from users where email = ?)", [TEST_EMAIL]).catch(() => {});
    await orm.em.getConnection().execute("delete from users where email = ?", [TEST_EMAIL]).catch(() => {});
  }
  await app?.close();
});

describe("Tunnel auth (e2e)", () => {
  const server = () => app.getHttpServer();

  it("inscription -> 201 + userId", async () => {
    const res = await request(server()).post("/auth/register").set("Authorization", origin())
      .send({ email: TEST_EMAIL, password: "motdepasse1" }).expect(201);
    userId = res.body.userId;
    expect(userId).toBeTruthy();
  });

  it("inscription en double -> 409", async () => {
    await request(server()).post("/auth/register").set("Authorization", origin())
      .send({ email: TEST_EMAIL, password: "motdepasse1" }).expect(409);
  });

  it("connexion -> 200 + token de session", async () => {
    const res = await request(server()).post("/auth/login").set("Authorization", origin())
      .send({ email: TEST_EMAIL, password: "motdepasse1" }).expect(200);
    expect(res.body.userId).toBe(userId);
    expect(typeof res.body.token).toBe("string");
  });

  it("mauvais mot de passe -> 401 générique", async () => {
    await request(server()).post("/auth/login").set("Authorization", origin())
      .send({ email: TEST_EMAIL, password: "FAUX" }).expect(401);
  });

  it("session -> userId, puis whoami (identité) -> 200, puis logout -> 401", async () => {
    const login = await request(server()).post("/auth/login").set("Authorization", origin())
      .send({ email: TEST_EMAIL, password: "motdepasse1" }).expect(200);
    const token = login.body.token as string;

    const session = await request(server()).get("/auth/session").set("Authorization", origin())
      .set("x-session-token", token).expect(200);
    expect(session.body.userId).toBe(userId);

    await request(server()).get("/whoami").set("Authorization", identity(userId)).expect(200);

    await request(server()).post("/auth/logout").set("Authorization", origin())
      .set("x-session-token", token).expect(204);

    await request(server()).get("/auth/session").set("Authorization", origin())
      .set("x-session-token", token).expect(401);
  });
});
