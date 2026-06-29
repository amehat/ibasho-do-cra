import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { HealthService } from "../application/health.service";
import { HealthResponseDto } from "./health.dto";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @ApiOkResponse({ type: HealthResponseDto })
  async get(): Promise<HealthResponseDto> {
    return this.health.check();
  }
}
