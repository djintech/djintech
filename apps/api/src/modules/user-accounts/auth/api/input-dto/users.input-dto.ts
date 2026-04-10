import { IsEmail, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  emailConstraints,
  passwordConstraints,
  usernameConstraints,
} from '../../domain/value-objects/user.value-object';
import { IsStringWithTrim } from '@src/core/decorators/validation/is-string-with-trim';

export class CreateUserInputDto {
  @ApiProperty({
    minLength: usernameConstraints.minLength,
    maxLength: usernameConstraints.maxLength,
    example: 'string',
    pattern: usernameConstraints.match.toString(), // Преобразуем RegExp в строку
  })
  @IsStringWithTrim(
    usernameConstraints.minLength,
    usernameConstraints.maxLength,
  )
  @Matches(usernameConstraints.match)
  username!: string;

  @ApiProperty({
    minLength: passwordConstraints.minLength,
    maxLength: passwordConstraints.maxLength,
    example: 'string1Aa',
    pattern: passwordConstraints.match.toString(),
  })
  @IsStringWithTrim(
    passwordConstraints.minLength,
    passwordConstraints.maxLength,
  )
  password!: string;

  @ApiProperty({
    pattern: emailConstraints.match.toString(), // Преобразуем RegExp в строку
    example: 'string@example.com',
    description: 'must be unique',
  })
  @IsStringWithTrim(emailConstraints.minLength, emailConstraints.maxLength)
  @IsEmail()
  email!: string;
}
