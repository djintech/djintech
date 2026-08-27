import { ApiProperty } from "@nestjs/swagger";
import { PostFullInfo } from "../../infrastructure/types/post-include.type";

export class PostImageViewDto {
  @ApiProperty()
  url!: string;

  @ApiProperty()
  position!: number;
}

class ownerViewDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;
}

export class PostViewDto {
  @ApiProperty()
  id!:	number;

  @ApiProperty()
  owner!: ownerViewDto;

  @ApiProperty({ type: String, nullable: true })
  description!: string | null;
  
  @ApiProperty({ type: () => [PostImageViewDto] })
  images!: PostImageViewDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  likesCount!: number;

  @ApiProperty()
  isLiked!: boolean;

  @ApiProperty({ type: [String] })
  avatarWhoLikes!: string[];

  static mapToView( post: PostFullInfo, buildUrl: (key: string) => string, currentUserId?: number ): PostViewDto {
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

    dto.likesCount = post._count.postLikes;

    dto.isLiked = currentUserId
      ? post.postLikes.some( (like) => like.userId === currentUserId )
      : false;

    dto.avatarWhoLikes = post.postLikes
      .map( (like) =>  like.user.profile?.avatar )
      .filter( (avatar): avatar is NonNullable<typeof avatar> => avatar !== null && avatar !== undefined )
      .map((avatar) => buildUrl(avatar.key) );

    return dto;
  }
}