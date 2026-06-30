import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";

// Extrait le userId de l'identité signée (posée par BffIdentityGuard). Défense en profondeur :
// lève 401 si absent (une route authentifiée ne doit jamais s'exécuter sans userId). AD-14.
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest<{ identity?: { userId?: string } }>();
  const userId = req.identity?.userId;
  if (!userId) throw new UnauthorizedException();
  return userId;
});
