import { ApiProperty } from "@nestjs/swagger";

export class PostImageViewDto {
  @ApiProperty()
  url: string;

  @ApiProperty()
  position: number;
}

class ownerViewDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

interface PostInfoInputDto {
  id: number;
  owner: ownerViewDto;
  description: string | null;
  images: PostImageViewDto[];
  createdAt: Date,
};

export class PostViewDto {
  @ApiProperty()
  id:	string;

  @ApiProperty()
  owner: ownerViewDto;

  @ApiProperty()
  description: string | null;
  
  @ApiProperty({ type: () => [PostImageViewDto] })
  images: PostImageViewDto[];

  @ApiProperty()
  createdAt: Date;

  static mapToView( post ): PostViewDto {
    const dto = new PostViewDto();

    dto.id = post.id!.toString();
    dto.owner = post.owner;
    dto.description = post.description;
    dto.images = post.images;
    dto.createdAt = post.createdAt;
    dto.owner = {
      id: post.owner.id,
      name: post.owner.name,
    };
    dto.images = post.images
      .sort((a, b) => a.position - b.position)
      .map((img) => ({
        url: img.url,
        position: img.position,
      }));

    return dto;
  }
}