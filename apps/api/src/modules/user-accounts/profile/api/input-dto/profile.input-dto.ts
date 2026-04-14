import { ApiProperty } from '@nestjs/swagger';
import { IsStringWithTrim } from '@src/core/decorators/validation/is-string-with-trim';
import { usernameConstraints } from '@src/modules/user-accounts/auth/domain/value-objects/user.value-object';
import { IsDateString, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { aboutMeConstraints, countryOrCityConstraints, firstOrLastNameConstraints } from '../../domain/value-objects/profile.value-objects';
import { MinAge } from '@src/core/decorators/validation/min-age';
import { MIN_AGE } from '../../constants';
import { Type } from 'class-transformer';

export class ProfileInputDto {
  @ApiProperty({
    minLength: usernameConstraints.minLength,
    maxLength: usernameConstraints.maxLength,
    example: 'user_1',
    pattern: usernameConstraints.match.toString(), // Преобразуем RegExp в строку
    description: 'User login name (6-30 chars, letters, numbers, _ and -)'
  })
  @IsStringWithTrim( usernameConstraints.minLength, usernameConstraints.maxLength )
  @Matches(usernameConstraints.match)
  userName!: string;

  @ApiProperty({
    minLength: firstOrLastNameConstraints.minLength,
    maxLength: firstOrLastNameConstraints.maxLength,
    pattern: firstOrLastNameConstraints.match.toString(),
    example: 'John',
    description: 'User first name (1-50, Latin and Cyrillic letters)'
  } )
  @IsStringWithTrim( firstOrLastNameConstraints.minLength, firstOrLastNameConstraints.maxLength )
  @Matches( firstOrLastNameConstraints.match )
  firstName!: string;

  @ApiProperty({
    minLength: firstOrLastNameConstraints.minLength,
    maxLength: firstOrLastNameConstraints.maxLength,
    pattern: firstOrLastNameConstraints.match.toString(),
    example: 'Doe',
    description: 'User last name (1-50, Latin and Cyrillic letters)'
  } )
  @IsStringWithTrim( firstOrLastNameConstraints.minLength, firstOrLastNameConstraints.maxLength )
  @Matches( firstOrLastNameConstraints.match )
  lastName!: string;

  @IsOptional()
  @IsDateString()
  @MinAge( MIN_AGE )
  @ApiProperty( { required: false, example: '2026-04-10T00:00:00.000Z', description: 'Birth date. For users over 12 years of age' })
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: 'About me', type: 'string', maxLength: aboutMeConstraints.maxLength, description: 'Short user bio (max 200 chars)' } )
  @MaxLength( aboutMeConstraints.maxLength )
  aboutMe?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, type: 'string', example: 'USA', maxLength: countryOrCityConstraints.maxLength, description: 'User country (optional, max 100 chars)' })
  @MaxLength( countryOrCityConstraints.maxLength )
  country?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, type: 'string', example: 'New York', maxLength: countryOrCityConstraints.maxLength, description: 'User city (optional, max 100 chars)'})
  @MaxLength( countryOrCityConstraints.maxLength )
  city?: string;
}