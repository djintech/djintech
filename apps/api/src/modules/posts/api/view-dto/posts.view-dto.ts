import { ApiProperty } from "@nestjs/swagger";
import { PostFullInfo } from "../../infrastructure/query/posts.query.repository";

export class PostImageViewDto {
  @ApiProperty()
  url: string;

  @ApiProperty()
  position: number;
}

class ownerViewDto {
  @ApiProperty()
  id: number;

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
  id:	number;

  @ApiProperty()
  owner: ownerViewDto;

  @ApiProperty({ type: String, nullable: true })
  description: string | null;
  
  @ApiProperty({ type: () => [PostImageViewDto] })
  images: PostImageViewDto[];

  @ApiProperty()
  createdAt: Date;

  static mapToView( post: PostFullInfo, buildUrl: (key: string) => string ): PostViewDto {
    const dto = new PostViewDto();

    dto.id = post.id;
    dto.description = post.description;
    dto.createdAt = post.createdAt;
    dto.owner = {
      id: post.user.id,
      name: post.user.username,
    };
    dto.images = post.postImages
      .sort((a, b) => a.position - b.position)
      .map((img) => ({
        url: buildUrl(img.key),
        position: img.position,
      }));

    return dto;
  }
}