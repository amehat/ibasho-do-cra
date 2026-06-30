import { Controller, Get, Req } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { BffIdentity } from "./bff-identity";
import { WhoamiResponseDto } from "./whoami.dto";

// Gardé par la garde globale (AD-14). Démontre le chemin navigateur -> BFF -> API (AD-1).
@ApiTags("iam")
@Controller("whoami")
export class WhoamiController {
  @Get()
  @ApiOkResponse({ type: WhoamiResponseDto })
  whoami(@Req() req: { identity?: BffIdentity }): WhoamiResponseDto {
    return { userId: req.identity!.userId };
  }
}
