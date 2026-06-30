import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

// Rate-limit du login CLÉ PAR EMAIL (et non par IP) : pertinent derrière le BFF
// (toutes les requêtes API viennent de la même origine) -> anti brute-force par compte (AD-14).
@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const body = (req.body ?? {}) as { email?: string };
    return body.email ?? (req.ip as string) ?? "unknown";
  }
}
