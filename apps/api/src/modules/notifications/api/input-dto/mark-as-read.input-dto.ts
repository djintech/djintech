import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsInt, IsNotEmpty } from 'class-validator';

export class MarkAsReadInputDto {
  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @IsNotEmpty({ each: true })
  ids!: number[];
}
