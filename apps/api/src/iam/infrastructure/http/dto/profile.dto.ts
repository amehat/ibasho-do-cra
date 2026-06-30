import { ApiProperty } from "@nestjs/swagger";
import { Role } from "../../../domain/role";

export class MyOrganisationDto {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String }) nom!: string;
  @ApiProperty({ enum: Role, isArray: true }) roles!: Role[];
}
export class MyProfileDto {
  @ApiProperty({ type: String }) userId!: string;
  @ApiProperty({ type: String, nullable: true }) email!: string | null;
  @ApiProperty({ type: MyOrganisationDto, isArray: true }) organisations!: MyOrganisationDto[];
}
