import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { verifyBffToken, type BffIdentity } from "./bff-identity";

interface RequestLike {
  headers: Record<string, string | string[] | undefined>;
  identity?: BffIdentity;
}

// Garde NestJS : aucune requête n'est servie sans le credential signé du BFF (AD-14).
// La frontière de confiance est le secret partagé, pas le réseau (mutualisé o2switch).
@Injectable()
export class BffIdentityGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<RequestLike>();
    const raw = req.headers["authorization"];
    const header = Array.isArray(raw) ? raw[0] ?? "" : raw ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    const secret = process.env.BFF_SHARED_SECRET;
    if (!secret) throw new UnauthorizedException("BFF_SHARED_SECRET non configuré");
    try {
      req.identity = verifyBffToken(token, secret);
      return true;
    } catch {
      throw new UnauthorizedException("Credential BFF invalide");
    }
  }
}
