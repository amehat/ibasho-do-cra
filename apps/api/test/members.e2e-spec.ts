import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { MikroORM } from "@mikro-orm/core";
import request from "supertest";
import jwt from "jsonwebtoken";
import { AppModule } from "../src/app.module";

const SECRET = "e2e-shared-secret-abcdef123456";
const origin = () => `Bearer ${jwt.sign({}, SECRET, { algorithm: "HS256", expiresIn: "60s" })}`;
const identity = (uid: string) => `Bearer ${jwt.sign({ sub: uid }, SECRET, { algorithm: "HS256", expiresIn: "60s" })}`;
const EMAIL_A = "e2e-owner@e2e.test";
const EMAIL_B = "e2e-member@e2e.test";

let app: INestApplication;
let orm: MikroORM;
let userA = "";
let userB = "";
let orgId = "";

async function cleanup(): Promise<void> {
  const c = orm.em.getConnection();
  const users: Array<{ id: string }> = await c
    .execute("select id from users where email in (?, ?)", [EMAIL_A, EMAIL_B]).catch(() => []);
  const ids = users.map((u) => u.id);
  if (ids.length) {
    const ph = ids.map(() => "?").join(",");
    const orgs: Array<{ org_id: string }> = await c
      .execute(`select distinct org_id from memberships where user_id in (${ph})`, ids).catch(() => []);
    await c.execute(`delete from memberships where user_id in (${ph})`, ids).catch(() => {});
    for (const o of orgs) await c.execute("delete from organisations where id = ?", [o.org_id]).catch(() => {});
    await c.execute(`delete from sessions where user_id in (${ph})`, ids).catch(() => {});
    await c.execute(`delete from users where id in (${ph})`, ids).catch(() => {});
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
  const srv = app.getHttpServer();
  userA = (await request(srv).post("/auth/register").set("Authorization", origin()).send({ email: EMAIL_A, password: "motdepasse1" }).expect(201)).body.userId;
  userB = (await request(srv).post("/auth/register").set("Authorization", origin()).send({ email: EMAIL_B, password: "motdepasse1" }).expect(201)).body.userId;
  orgId = (await request(srv).post("/organisations").set("Authorization", identity(userA)).send({ nom: "Acme e2e", type: "prestataire" }).expect(201)).body.organisationId;
}, 40000);

afterAll(async () => {
  if (orm) await cleanup();
  await app?.close();
});

describe("Members (e2e)", () => {
  const srv = () => app.getHttpServer();

  it("owner ajoute un membre avec rôle", async () => {
    const res = await request(srv()).post(`/organisations/${orgId}/members`).set("Authorization", identity(userA))
      .send({ email: EMAIL_B, roles: ["prestataire"] }).expect(201);
    expect(res.body.userId).toBe(userB);
  });

  it("owner liste les membres (lui + le nouveau)", async () => {
    const res = await request(srv()).get(`/organisations/${orgId}/members`).set("Authorization", identity(userA)).expect(200);
    const ids = res.body.map((m: { userId: string }) => m.userId);
    expect(ids).toContain(userA);
    expect(ids).toContain(userB);
  });

  it("non-owner -> 403", async () => {
    await request(srv()).get(`/organisations/${orgId}/members`).set("Authorization", identity(userB)).expect(403);
  });

  it("rôle invalide pour orga prestataire -> 400", async () => {
    await request(srv()).post(`/organisations/${orgId}/members`).set("Authorization", identity(userA))
      .send({ email: EMAIL_B, roles: ["valideur"] }).expect(400);
  });

  it("désactivation d'un membre -> 204, puis inactif", async () => {
    await request(srv()).delete(`/organisations/${orgId}/members/${userB}`).set("Authorization", identity(userA)).expect(204);
    const res = await request(srv()).get(`/organisations/${orgId}/members`).set("Authorization", identity(userA)).expect(200);
    expect(res.body.find((m: { userId: string }) => m.userId === userB).isActive).toBe(false);
  });

  it("réactivation idempotente -> pas de doublon", async () => {
    await request(srv()).post(`/organisations/${orgId}/members`).set("Authorization", identity(userA))
      .send({ email: EMAIL_B, roles: ["prestataire"] }).expect(201);
    const res = await request(srv()).get(`/organisations/${orgId}/members`).set("Authorization", identity(userA)).expect(200);
    const bEntries = res.body.filter((m: { userId: string }) => m.userId === userB);
    expect(bEntries).toHaveLength(1);
    expect(bEntries[0].isActive).toBe(true);
  });

  it("POST ne peut pas retirer owner au dernier propriétaire (AD-23) -> 409", async () => {
    await request(srv()).post(`/organisations/${orgId}/members`).set("Authorization", identity(userA))
      .send({ email: EMAIL_A, roles: ["prestataire"] }).expect(409);
  });

  it("désactivation du dernier propriétaire -> 409 (AD-23)", async () => {
    await request(srv()).delete(`/organisations/${orgId}/members/${userA}`).set("Authorization", identity(userA)).expect(409);
  });
});
