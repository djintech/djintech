import { ApiProperty } from "@nestjs/swagger";
import { CommentForView } from "../../infrastructure/comments.repository";

export class ParentViewDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  username!: string;

  @ApiProperty()
  avatar!: string | null;
}

export class CommentViewDto {
  @ApiProperty()
  id!:	number;
  
  @ApiProperty()
  postId!:	number;

  @ApiProperty()
  from!: ParentViewDto;

  @ApiProperty({ type: String })
  content!: string;

  @ApiProperty()
  createdAt!: Date;
  
  @ApiProperty()
  answerCount!: number;

  @ApiProperty()  
  likeCount!: number;
  
  @ApiProperty()
  isLiked!: boolean;

  static mapToView( comment: CommentForView, buildUrl: (key: string) => string ): CommentViewDto {
    const dto = new CommentViewDto();

    dto.id = comment.id;
    dto.postId = comment.postId;

    dto.from = new ParentViewDto();
    dto.from.id = comment.user.id;
    dto.from.username = comment.user.username;
    dto.from.avatar = comment.user.avatarKey
      ? buildUrl(comment.user.avatarKey)
      : null;

    dto.content = comment.content;
    dto.createdAt = comment.createdAt;
    dto.answerCount = comment.answerCount;
    dto.likeCount = comment.likeCount;
    dto.isLiked = comment.isLiked;

    return dto;
  }
}