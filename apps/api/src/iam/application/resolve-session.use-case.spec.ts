import { describe, it, expect } from "vitest";
import { ResolveSession } from "./resolve-session.use-case";
import { InvalidSessionError } from "./errors";
import { Session } from "../domain/session";
import type { SessionRepository } from "../domain/ports/session-repository.port";
import type { UserRepository } from "../domain/ports/user-repository.port";
import { User } from "../domain/user";
import { Email } from "../domain/value-objects/email";
import { PasswordHash } from "../domain/value-objects/password-hash";

const now = new Date("2026-06-30T10:00:00Z");
const clock = { now: () => now };
const activeUser = User.register("u1", Email.create("u@example.com"), PasswordHash.fromHashed("h:x"));
const users: UserRepository = { async findByEmail() { return null; }, async findById() { return activeUser; }, async save() {} };
function repoWith(s: Session | null): SessionRepository {
  return { async findByToken() { return s; }, async save() {} };
}

describe("ResolveSession", () => {
  it("résout une session valide", async () => {
    const uc = new ResolveSession(repoWith(Session.start("t", "u1", now, 1000 * 60)), users, clock);
    expect(await uc.execute("t")).toEqual({ userId: "u1" });
  });
  it("rejette une session expirée", async () => {
    const expired = Session.start("t", "u1", new Date(now.getTime() - 1000 * 120), 1000 * 60);
    await expect(new ResolveSession(repoWith(expired), users, clock).execute("t")).rejects.toBeInstanceOf(InvalidSessionError);
  });
  it("rejette une session révoquée", async () => {
    const s = Session.start("t", "u1", now, 1000 * 60 * 60);
    s.revoke(now);
    await expect(new ResolveSession(repoWith(s), users, clock).execute("t")).rejects.toBeInstanceOf(InvalidSessionError);
  });
  it("rejette un jeton inconnu", async () => {
    await expect(new ResolveSession(repoWith(null), users, clock).execute("t")).rejects.toBeInstanceOf(InvalidSessionError);
  });
});
