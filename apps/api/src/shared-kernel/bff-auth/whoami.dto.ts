import { ApiProperty } from "@nestjs/swagger";

export class WhoamiResponseDto {
  @ApiProperty({ type: String }) userId!: string;
}
