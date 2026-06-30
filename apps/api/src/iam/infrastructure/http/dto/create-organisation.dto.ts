import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateOrganisationDto {
  @ApiProperty({ type: String, maxLength: 200 }) @IsString() @IsNotEmpty() @MaxLength(200) nom!: string;
  @ApiProperty({ enum: ["prestataire", "cliente"] }) @IsIn(["prestataire", "cliente"]) type!: "prestataire" | "cliente";
}
