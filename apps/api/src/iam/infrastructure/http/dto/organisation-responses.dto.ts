import { ApiProperty } from "@nestjs/swagger";

export class OrganisationIdResponseDto {
  @ApiProperty({ type: String }) organisationId!: string;
}
export class OrganisationDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String }) nom!: string;
  @ApiProperty({ enum: ["prestataire", "cliente"] }) type!: "prestataire" | "cliente";
}
