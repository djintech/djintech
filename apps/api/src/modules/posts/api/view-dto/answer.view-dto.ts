import { ApiProperty } from "@nestjs/swagger";
import { AnswerForView } from "../../infrastructure/comments.repository";
import { ParentViewDto } from "./comment.view-dto";

export class AnswerViewDto {
  @ApiProperty()
  id!:	number;
  
  @ApiProperty()
  parentCommentId!:	number;

  @ApiProperty()
  from!: ParentViewDto;

  @ApiProperty({ type: String })
  content!: string;

  @ApiProperty()
  createdAt!: Date;
  
  @ApiProperty()  
  likeCount!: number;
  
  @ApiProperty()
  isLiked!: boolean;

  static mapToView( comment: AnswerForView, buildUrl: (key: string) => string ): AnswerViewDto {
    const dto = new AnswerViewDto();

    dto.id = comment.id;
    dto.parentCommentId = comment.parentId;

    dto.from = new ParentViewDto();
    dto.from.id = comment.user.id;
    dto.from.username = comment.user.username;
    dto.from.avatar = comment.user.avatarKey
      ? buildUrl(comment.user.avatarKey)
      : null;

    dto.content = comment.content;
    dto.createdAt = comment.createdAt;
    dto.likeCount = comment.likeCount;
    dto.isLiked = comment.isLiked;

    return dto;
  }
}