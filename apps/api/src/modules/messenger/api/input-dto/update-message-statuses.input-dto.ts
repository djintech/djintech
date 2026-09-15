import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, ArrayUnique, IsArray, IsInt, IsNotEmpty} from 'class-validator';

export class UpdateMessageStatusDto {
  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()  
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsInt({ each: true })
  @IsNotEmpty({ each: true })
  ids!: number[];
}
