import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsEmail, IsEnum } from "class-validator";
import { Role } from "../../../domain/role";

export class AddMemberDto {
  @ApiProperty({ type: String }) @IsEmail() email!: string;
  @ApiProperty({ enum: Role, isArray: true }) @IsArray() @ArrayNotEmpty() @IsEnum(Role, { each: true }) roles!: Role[];
}
export class ChangeRolesDto {
  @ApiProperty({ enum: Role, isArray: true }) @IsArray() @ArrayNotEmpty() @IsEnum(Role, { each: true }) roles!: Role[];
}
export class MemberDto {
  @ApiProperty({ type: String }) userId!: string;
  @ApiProperty({ type: String, nullable: true }) email!: string | null;
  @ApiProperty({ enum: Role, isArray: true }) roles!: Role[];
  @ApiProperty({ type: Boolean }) isActive!: boolean;
}
export class AddMemberResponseDto {
  @ApiProperty({ type: String }) userId!: string;
  @ApiProperty({ enum: Role, isArray: true }) roles!: Role[];
}
