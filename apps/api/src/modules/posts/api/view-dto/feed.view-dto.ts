import { ApiProperty } from '@nestjs/swagger';
import { PostViewDto } from './posts.view-dto';
import { CommentViewDto } from './comment.view-dto';
import { FeedFullInfo } from '../../infrastructure/types/feed.type';

export class FeedViewDto extends PostViewDto {
  @ApiProperty({
    type: () => [CommentViewDto],
    description: 'Top-level comments of the post',
  })
  comments!: CommentViewDto[];

  static mapToView(
    post: FeedFullInfo,
    buildUrl: (key: string) => string,
    currentUserId: number,
  ): FeedViewDto {
    const dto = new FeedViewDto();

    const postView = PostViewDto.mapToView(
      post,
      buildUrl,
      currentUserId,
    );

    Object.assign(dto, postView);

    dto.isLiked = post.isLikedByCurrentUser;
    
    dto.comments = post.comments.map((comment) =>
      CommentViewDto.mapToView(
        comment,
        buildUrl,
      ),
    );

    return dto;
  }
}