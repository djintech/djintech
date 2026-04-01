import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { PostInputDto } from './posts.input-dto';

class FilesDto {
  @ApiProperty({
  type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  files: any[];
}

export class CreatePostWithFilesDto extends IntersectionType(
  PostInputDto,
  FilesDto,
) {}
