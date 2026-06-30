import {
  BadRequestException, Body, ConflictException, Controller, Delete, ForbiddenException, Get,
  HttpCode, NotFoundException, Param, Patch, Post
} from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../../shared-kernel/bff-auth/current-user.decorator";
import { AddOrUpdateMember } from "../../application/add-or-update-member.use-case";
import { ChangeMemberRoles } from "../../application/change-member-roles.use-case";
import { DeactivateMember } from "../../application/deactivate-member.use-case";
import { ListMembers } from "../../application/list-members.use-case";
import {
  ForbiddenMembershipError, MemberNotFoundError, OrganisationNotFoundError, UserNotFoundError
} from "../../application/errors";
import { LastOwnerError } from "../../domain/membership-rules";
import { InvalidRolesError } from "../../domain/value-objects/role-policy";
import { InvalidEmailError } from "../../domain/value-objects/email";
import { AddMemberDto, AddMemberResponseDto, ChangeRolesDto, MemberDto } from "./dto/member.dto";

// Mappe les erreurs domaine/application vers les statuts HTTP.
function mapError(e: unknown): never {
  if (e instanceof ForbiddenMembershipError) throw new ForbiddenException(e.message);
  if (e instanceof LastOwnerError) throw new ConflictException(e.message);
  if (e instanceof OrganisationNotFoundError || e instanceof UserNotFoundError || e instanceof MemberNotFoundError)
    throw new NotFoundException(e instanceof Error ? e.message : "Introuvable");
  if (e instanceof InvalidRolesError || e instanceof InvalidEmailError) throw new BadRequestException(e.message);
  throw e;
}

// Sous-ressource authentifiée : gestion des membres d'une organisation (owner uniquement). AD-9/AD-10/AD-14.
@ApiTags("members")
@Controller("organisations/:orgId/members")
export class MembersController {
  constructor(
    private readonly add: AddOrUpdateMember,
    private readonly changeRoles: ChangeMemberRoles,
    private readonly deactivate: DeactivateMember,
    private readonly list: ListMembers
  ) {}

  @Get()
  @ApiOkResponse({ type: MemberDto, isArray: true })
  async listMembers(@CurrentUser() actorId: string, @Param("orgId") orgId: string): Promise<MemberDto[]> {
    try {
      return await this.list.execute(actorId, orgId);
    } catch (e) {
      mapError(e);
    }
  }

  @Post()
  @ApiBody({ type: AddMemberDto })
  @ApiOkResponse({ type: AddMemberResponseDto })
  async addMember(
    @CurrentUser() actorId: string,
    @Param("orgId") orgId: string,
    @Body() dto: AddMemberDto
  ): Promise<AddMemberResponseDto> {
    try {
      return await this.add.execute(actorId, orgId, dto.email, dto.roles);
    } catch (e) {
      mapError(e);
    }
  }

  @Patch(":userId")
  @ApiBody({ type: ChangeRolesDto })
  @HttpCode(204)
  async patchRoles(
    @CurrentUser() actorId: string,
    @Param("orgId") orgId: string,
    @Param("userId") userId: string,
    @Body() dto: ChangeRolesDto
  ): Promise<void> {
    try {
      await this.changeRoles.execute(actorId, orgId, userId, dto.roles);
    } catch (e) {
      mapError(e);
    }
  }

  @Delete(":userId")
  @HttpCode(204)
  async deactivateMember(
    @CurrentUser() actorId: string,
    @Param("orgId") orgId: string,
    @Param("userId") userId: string
  ): Promise<void> {
    try {
      await this.deactivate.execute(actorId, orgId, userId);
    } catch (e) {
      mapError(e);
    }
  }
}
