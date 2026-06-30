import { Controller, Get, UnauthorizedException } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../../shared-kernel/bff-auth/current-user.decorator";
import { GetMyProfile } from "../../application/get-my-profile.use-case";
import { MyProfileDto } from "./dto/profile.dto";

// Profil de l'utilisateur courant (authentifié). Identité + organisations/rôles résolus à la requête (AD-14).
@ApiTags("me")
@Controller("me")
export class MeController {
  constructor(private readonly getMyProfile: GetMyProfile) {}

  @Get()
  @ApiOkResponse({ type: MyProfileDto })
  async me(@CurrentUser() userId: string): Promise<MyProfileDto> {
    const profile = await this.getMyProfile.execute(userId);
    if (!profile) throw new UnauthorizedException("Compte introuvable");
    return profile;
  }
}
