import { ApiProperty } from "@nestjs/swagger";
import { passwordConstraints } from "../../domain/value-objects/user.value-object";
import { IsStringWithTrim } from "@src/core/decorators/validation/is-string-with-trim";
import { IsString } from "class-validator";

export class NewPasswordInputDto {
  @ApiProperty({
    minLength: passwordConstraints.minLength,
    maxLength: passwordConstraints.maxLength,
  })
  @IsStringWithTrim(passwordConstraints.minLength, passwordConstraints.maxLength)
  newPassword: string;

  @ApiProperty({ example: 'f6f6f742-14f4-49e5-b492-76e55ed25ebd'})
  @IsString()
  recoveryCode: string;
}
