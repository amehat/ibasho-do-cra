import { Controller, Get, Req, UnauthorizedException } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { BffIdentity } from "./bff-identity";
import { WhoamiResponseDto } from "./whoami.dto";

// Route authentifiée (garde globale par défaut = userId requis). Démontre BFF -> API (AD-1, AD-14).
@ApiTags("iam")
@Controller("whoami")
export class WhoamiController {
  @Get()
  @ApiOkResponse({ type: WhoamiResponseDto })
  whoami(@Req() req: { identity?: BffIdentity }): WhoamiResponseDto {
    const userId = req.identity?.userId;
    if (!userId) throw new UnauthorizedException();
    return { userId };
  }
}
