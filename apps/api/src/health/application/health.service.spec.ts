import { describe, it, expect } from "vitest";
import { HealthService } from "./health.service";

describe("HealthService", () => {
  it("rapporte db=up quand le ping réussit", async () => {
    const svc = new HealthService({ ping: async () => true });
    const r = await svc.check();
    expect(r.status).toBe("ok");
    expect(r.db).toBe("up");
    expect(r.uptimeSeconds).toBeGreaterThanOrEqual(0);
  });

  it("rapporte db=down quand le ping échoue", async () => {
    const svc = new HealthService({ ping: async () => false });
    expect((await svc.check()).db).toBe("down");
  });

  it("rapporte db=unknown quand le ping lève", async () => {
    const svc = new HealthService({ ping: async () => { throw new Error("boom"); } });
    expect((await svc.check()).db).toBe("unknown");
  });
});
