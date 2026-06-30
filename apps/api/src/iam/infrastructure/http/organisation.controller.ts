import { BadRequestException, Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../../shared-kernel/bff-auth/current-user.decorator";
import { CreateOrganisation } from "../../application/create-organisation.use-case";
import { ListMyOrganisations } from "../../application/list-my-organisations.use-case";
import { InvalidOrganisationNameError } from "../../domain/organisation";
import { InvalidOrganisationTypeError } from "../../domain/value-objects/organisation-type";
import { CreateOrganisationDto } from "./dto/create-organisation.dto";
import { OrganisationDto, OrganisationIdResponseDto } from "./dto/organisation-responses.dto";

// Routes AUTHENTIFIÉES (garde par défaut -> sub requis). Le userId vient de @CurrentUser (AD-1, AD-14).
@ApiTags("organisations")
@Controller("organisations")
export class OrganisationController {
  constructor(
    private readonly createOrg: CreateOrganisation,
    private readonly listOrgs: ListMyOrganisations
  ) {}

  @Post()
  @ApiBody({ type: CreateOrganisationDto })
  @ApiCreatedResponse({ type: OrganisationIdResponseDto })
  async create(@CurrentUser() userId: string, @Body() dto: CreateOrganisationDto): Promise<OrganisationIdResponseDto> {
    try {
      return await this.createOrg.execute(userId, dto.nom, dto.type);
    } catch (e) {
      if (e instanceof InvalidOrganisationTypeError || e instanceof InvalidOrganisationNameError) {
        throw new BadRequestException("Données d'organisation invalides");
      }
      throw e;
    }
  }

  @Get()
  @ApiOkResponse({ type: OrganisationDto, isArray: true })
  async list(@CurrentUser() userId: string): Promise<OrganisationDto[]> {
    return this.listOrgs.execute(userId);
  }
}
