import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty({ type: String, maxLength: 254 }) @IsEmail() @MaxLength(254) email!: string;
  @ApiProperty({ type: String, minLength: 8, maxLength: 128 }) @IsString() @MinLength(8) @MaxLength(128) password!: string;
}
