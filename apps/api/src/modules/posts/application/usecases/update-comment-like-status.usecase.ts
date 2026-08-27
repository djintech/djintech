import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { UpdateCommentLikeStatusInputDto } from "../../api/input-dto/update-comment-like-status.input-dto";
import { CommentsRepository } from "../../infrastructure/comments.repository";
import { CommentLikesRepository } from "../../infrastructure/comment-likes.repository";

export class UpdateCommentLikeStatusCommand {
  constructor(
    public userId: number,
    public postId: number,
    public commentId: number,
    public readonly dto: UpdateCommentLikeStatusInputDto,
  ) {}
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusUseCase
  implements ICommandHandler<UpdateCommentLikeStatusCommand, void>
{
  constructor( 
    private commentsRepository: CommentsRepository,
    private commentLikesRepository: CommentLikesRepository,
  ){
  }

  async execute({ userId, postId, commentId, dto }: UpdateCommentLikeStatusCommand): Promise<void> {
    const comment = await this.commentsRepository.findCommentByIdAndPostId( commentId, postId);

    if ( !comment ){
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post comment not found',
        extensions: [{ message: 'Post comment not found', field: 'comment' }],
      });      
    }

    await this.commentLikesRepository.upsert( commentId, userId, dto.likeStatus );
    return;
  }
}