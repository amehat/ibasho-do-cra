import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BffIdentityGuard } from "./bff-identity.guard";
import type { BffIdentity } from "./bff-identity";

// Démonstration du chemin navigateur -> BFF -> API gardée (AD-1, AD-14).
@ApiTags("iam")
@Controller("whoami")
@UseGuards(BffIdentityGuard)
export class WhoamiController {
  @Get()
  whoami(@Req() req: { identity?: BffIdentity }): { userId: string | undefined } {
    return { userId: req.identity?.userId };
  }
}
