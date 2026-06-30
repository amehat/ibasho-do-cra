import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { MikroORM } from "@mikro-orm/core";
import request from "supertest";
import jwt from "jsonwebtoken";
import { AppModule } from "../src/app.module";

const SECRET = "e2e-shared-secret-abcdef123456";
const identity = (uid: string) => `Bearer ${jwt.sign({ sub: uid }, SECRET, { algorithm: "HS256", expiresIn: "60s" })}`;
const USER_A = "e2e-org-user-a";
const USER_B = "e2e-org-user-b";

let app: INestApplication;
let orm: MikroORM;

async function cleanup(): Promise<void> {
  const c = orm.em.getConnection();
  const rows: Array<{ org_id: string }> = await c
    .execute("select org_id from memberships where user_id in (?, ?)", [USER_A, USER_B])
    .catch(() => []);
  await c.execute("delete from memberships where user_id in (?, ?)", [USER_A, USER_B]).catch(() => {});
  for (const r of rows) {
    await c.execute("delete from organisations where id = ?", [r.org_id]).catch(() => {});
  }
}

beforeAll(async () => {
  process.env.BFF_SHARED_SECRET = SECRET;
  const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = mod.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
  orm = app.get(MikroORM);
  await cleanup();
}, 30000);

afterAll(async () => {
  if (orm) await cleanup();
  await app?.close();
});

describe("Organisations (e2e)", () => {
  const server = () => app.getHttpServer();
  let orgId = "";

  it("création authentifiée -> 201 + organisationId", async () => {
    const res = await request(server()).post("/organisations").set("Authorization", identity(USER_A))
      .send({ nom: "Acme Conseil", type: "prestataire" }).expect(201);
    orgId = res.body.organisationId;
    expect(orgId).toBeTruthy();
  });

  it("le créateur voit son organisation", async () => {
    const res = await request(server()).get("/organisations").set("Authorization", identity(USER_A)).expect(200);
    expect(res.body.map((o: { id: string }) => o.id)).toContain(orgId);
    expect(res.body.find((o: { id: string }) => o.id === orgId).type).toBe("prestataire");
  });

  it("un AUTRE utilisateur ne voit PAS cette organisation (cloisonnement AD-10)", async () => {
    const res = await request(server()).get("/organisations").set("Authorization", identity(USER_B)).expect(200);
    expect(res.body.map((o: { id: string }) => o.id)).not.toContain(orgId);
  });

  it("création sans identité -> 401", async () => {
    await request(server()).post("/organisations").send({ nom: "X", type: "cliente" }).expect(401);
  });

  it("type invalide -> 400", async () => {
    await request(server()).post("/organisations").set("Authorization", identity(USER_A))
      .send({ nom: "X", type: "autre" }).expect(400);
  });
});
