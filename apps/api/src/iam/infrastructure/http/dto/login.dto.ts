import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MaxLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ type: String, maxLength: 254 }) @IsEmail() @MaxLength(254) email!: string;
  @ApiProperty({ type: String, maxLength: 128 }) @IsString() @MaxLength(128) password!: string;
}
