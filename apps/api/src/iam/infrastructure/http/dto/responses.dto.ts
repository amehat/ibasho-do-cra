import { ApiProperty } from "@nestjs/swagger";

export class UserIdResponseDto {
  @ApiProperty({ type: String }) userId!: string;
}
export class LoginResponseDto {
  @ApiProperty({ type: String }) token!: string;
  @ApiProperty({ type: String }) userId!: string;
  @ApiProperty({ type: String, description: "ISO 8601" }) expiresAt!: string;
}
export class SessionResponseDto {
  @ApiProperty({ type: String }) userId!: string;
}
