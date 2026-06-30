import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import type { ExecutionContext } from "@nestjs/common";

// Rate-limit login (AD-14) : deux limites combinées —
//  - "login-email"  : 5/min par compte (clé = email NORMALISÉ, ferme le bypass de casse/espaces)
//  - "login-global" : plafond /min par IP source (limite le password-spraying multi-comptes)
@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const body = (req.body ?? {}) as { email?: string };
    return (body.email ?? "").trim().toLowerCase() || ((req.ip as string) ?? "unknown");
  }

  protected generateKey(context: ExecutionContext, suffix: string, name: string): string {
    if (name === "login-global") {
      const req = context.switchToHttp().getRequest<{ ip?: string }>();
      return `login-global:${req.ip ?? "unknown"}`;
    }
    return `login-email:${suffix}`;
  }
}
