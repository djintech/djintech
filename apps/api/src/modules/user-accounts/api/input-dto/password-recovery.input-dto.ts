import { IsStringWithTrim } from "@src/core/decorators/validation/is-string-with-trim";
import { IsString, Matches } from "class-validator";
import { emailConstraints } from "../../domain/value-objects/user.value-object";
import { ApiProperty } from "@nestjs/swagger";

export class PasswordRecoveryInputDto {
  @ApiProperty({ example: 'string@example.com' })
  @IsStringWithTrim(emailConstraints.minLength, emailConstraints.maxLength)
  @Matches(emailConstraints.match)
  email: string;

  @ApiProperty()
  @IsString()
  recaptcha: string;
}
