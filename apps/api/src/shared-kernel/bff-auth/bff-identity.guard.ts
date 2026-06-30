import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { verifyBffToken, type BffIdentity } from "./bff-identity";
import { IS_PUBLIC_KEY } from "./public.decorator";

interface RequestLike {
  headers: Record<string, string | string[] | undefined>;
  identity?: BffIdentity;
}

// Garde GLOBALE (default-deny, AD-14) : toute requête est rejetée sans credential signé du BFF,
// sauf les routes explicitement marquées @Public(). Frontière de confiance = le secret, pas le réseau.
@Injectable()
export class BffIdentityGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (isPublic) return true;

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
