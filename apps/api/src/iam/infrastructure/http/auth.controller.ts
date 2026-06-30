import {
  BadRequestException, Body, ConflictException, Controller, Get, Headers, HttpCode,
  Post, UnauthorizedException, UseGuards
} from "@nestjs/common";
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { UniqueConstraintViolationException } from "@mikro-orm/core";
import { BffOnly } from "../../../shared-kernel/bff-auth/bff-only.decorator";
import { RegisterUser } from "../../application/register-user.use-case";
import { AuthenticateCredentials } from "../../application/authenticate-credentials.use-case";
import { CreateSession } from "../../application/create-session.use-case";
import { ResolveSession } from "../../application/resolve-session.use-case";
import { RevokeSession } from "../../application/revoke-session.use-case";
import { EmailAlreadyUsedError, InvalidCredentialsError, InvalidSessionError } from "../../application/errors";
import { InvalidEmailError } from "../../domain/value-objects/email";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { LoginResponseDto, SessionResponseDto, UserIdResponseDto } from "./dto/responses.dto";
import { LoginThrottlerGuard } from "./login-throttler.guard";

// Endpoints pré-auth : @BffOnly (origine BFF vérifiée, userId pas encore connu) — AD-14.
@ApiTags("auth")
@Controller("auth")
@BffOnly()
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUser,
    private readonly authenticate: AuthenticateCredentials,
    private readonly createSession: CreateSession,
    private readonly resolveSession: ResolveSession,
    private readonly revokeSession: RevokeSession
  ) {}

  @Post("register")
  @UseGuards(LoginThrottlerGuard)
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({ type: UserIdResponseDto })
  async register(@Body() dto: RegisterDto): Promise<UserIdResponseDto> {
    try {
      return await this.registerUser.execute(dto.email, dto.password);
    } catch (e) {
      // Email dupliqué : détecté en amont (EmailAlreadyUsedError) OU en concurrence (violation d'unicité).
      if (e instanceof EmailAlreadyUsedError || e instanceof UniqueConstraintViolationException) {
        throw new ConflictException("Email déjà utilisé");
      }
      if (e instanceof InvalidEmailError) throw new BadRequestException("Email invalide");
      throw e;
    }
  }

  @Post("login")
  @UseGuards(LoginThrottlerGuard)
  @HttpCode(200)
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: LoginResponseDto })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    try {
      const { userId } = await this.authenticate.execute(dto.email, dto.password);
      const { token, expiresAt } = await this.createSession.execute(userId);
      return { token, userId, expiresAt: expiresAt.toISOString() };
    } catch (e) {
      if (e instanceof InvalidCredentialsError) throw new UnauthorizedException("Identifiants invalides");
      throw e;
    }
  }

  @Post("logout")
  @HttpCode(204)
  async logout(@Headers("x-session-token") token?: string): Promise<void> {
    if (token) await this.revokeSession.execute(token);
  }

  @Get("session")
  @ApiOkResponse({ type: SessionResponseDto })
  async session(@Headers("x-session-token") token?: string): Promise<SessionResponseDto> {
    if (!token) throw new UnauthorizedException();
    try {
      return await this.resolveSession.execute(token);
    } catch (e) {
      if (e instanceof InvalidSessionError) throw new UnauthorizedException();
      throw e;
    }
  }
}
