import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';
import { IsEmail } from 'class-validator';
import { emailConstraints } from '../../domain/value-objects/user.value-object';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrationEmailResendingInputDto {
  @ApiProperty({
    pattern: emailConstraints.match.toString(), // Преобразуем RegExp в строку
    example: 'string@example.com',
    description: 'must be unique',
  })
  @IsStringWithTrim(emailConstraints.minLength, emailConstraints.maxLength)
  @IsEmail()
  email: string;
}
