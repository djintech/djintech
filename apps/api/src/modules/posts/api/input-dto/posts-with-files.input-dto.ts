import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { CreatePostInputDto } from './posts.input-dto';

class FilesDto {
  @ApiProperty({
  type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  files: any[];
}

export class CreatePostWithFilesDto extends IntersectionType(
  CreatePostInputDto,
  FilesDto,
) {}
