import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class RegistrationConfirmationInputDto {
  @ApiProperty({ example: 'e55ca508-dc0e-438d-8996-c832f5cd466b' })
  @IsString()
  code:	string;
}
