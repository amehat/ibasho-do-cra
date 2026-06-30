import { ApiProperty } from "@nestjs/swagger";

// Types @ApiProperty explicites : OpenAPI fiable sans dépendre de reflect-metadata.
export class HealthResponseDto {
  @ApiProperty({ enum: ["ok"] }) status!: "ok";
  @ApiProperty({ type: Number }) uptimeSeconds!: number;
  @ApiProperty({ enum: ["up", "down", "unknown"] }) db!: "up" | "down" | "unknown";
}
