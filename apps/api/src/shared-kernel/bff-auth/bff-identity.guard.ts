import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { verifyBffOrigin, verifyBffToken, type BffIdentity } from "./bff-identity";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { IS_BFF_ONLY_KEY } from "./bff-only.decorator";

interface RequestLike {
  headers: Record<string, string | string[] | undefined>;
  identity?: BffIdentity;
}

// Garde GLOBALE default-deny (AD-14) :
//  - @Public()  -> aucune vérification (ex. /health)
//  - @BffOnly() -> origine BFF vérifiée, userId optionnel (routes pré-auth)
//  - défaut     -> origine BFF + userId requis (routes authentifiées)
@Injectable()
export class BffIdentityGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const targets = [ctx.getHandler(), ctx.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) return true;

    const req = ctx.switchToHttp().getRequest<RequestLike>();
    const raw = req.headers["authorization"];
    const header = Array.isArray(raw) ? raw[0] ?? "" : raw ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    const secret = process.env.BFF_SHARED_SECRET;
    if (!secret) throw new UnauthorizedException("BFF_SHARED_SECRET non configuré");

    const isBffOnly = this.reflector.getAllAndOverride<boolean>(IS_BFF_ONLY_KEY, targets);
    try {
      req.identity = isBffOnly ? verifyBffOrigin(token, secret) : verifyBffToken(token, secret);
      return true;
    } catch {
      throw new UnauthorizedException("Credential BFF invalide");
    }
  }
}
