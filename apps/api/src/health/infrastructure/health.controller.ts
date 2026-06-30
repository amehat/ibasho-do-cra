import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { HealthService } from "../application/health.service";
import { HealthResponseDto } from "./health.dto";
import { Public } from "../../shared-kernel/bff-auth/public.decorator";

@ApiTags("health")
@Controller("health")
@Public() // sonde de liveness publique (déploiement) — exemption explicite du default-deny
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @ApiOkResponse({ type: HealthResponseDto })
  async get(): Promise<HealthResponseDto> {
    return this.health.check();
  }
}
