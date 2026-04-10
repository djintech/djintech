import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginInputDto {
  @ApiProperty({ example: 'string@example.com', description: 'Email пользователя' })
  @IsString()
  email!: string;

  @ApiProperty({ example: 'string1Aa', description: 'Пароль пользователя' })
  @IsString()
  password!: string;
}