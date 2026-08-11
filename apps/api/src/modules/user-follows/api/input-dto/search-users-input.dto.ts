import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class SearchUsersInputDto {
  @ApiProperty({
    description: 'Полное или частичное совпадение по username',
    example: 'ivan',
  })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiPropertyOptional({
    description: 'ID последнего пользователя предыдущей страницы',
    example: 25,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cursor?: number;
}