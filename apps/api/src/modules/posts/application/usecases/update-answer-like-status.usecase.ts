import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { UpdateCommentLikeStatusInputDto } from "../../api/input-dto/update-comment-like-status.input-dto";
import { CommentsRepository } from "../../infrastructure/comments.repository";
import { CommentLikesRepository } from "../../infrastructure/comment-likes.repository";

export class UpdateAnswerLikeStatusCommand {
  constructor(
    public userId: number,
    public postId: number,
    public commentId: number,
    public answerId: number,
    public readonly dto: UpdateCommentLikeStatusInputDto,
  ) {}
}

@CommandHandler(UpdateAnswerLikeStatusCommand)
export class UpdateAnswerLikeStatusUseCase
  implements ICommandHandler<UpdateAnswerLikeStatusCommand, void>
{
  constructor( 
    private commentsRepository: CommentsRepository,
    private commentLikesRepository: CommentLikesRepository,
  ){
  }

  async execute({ userId, postId, commentId, answerId, dto }: UpdateAnswerLikeStatusCommand): Promise<void> {
    const answer = await this.commentsRepository.findAnswerByIdAndCommentIdAndPostId( answerId, commentId, postId);

    if ( !answer ){
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post comment answer not found',
        extensions: [{ message: 'Post comment answer not found', field: 'answer' }],
      });      
    }

    await this.commentLikesRepository.upsert( answerId, userId, dto.likeStatus );
    return;
  }
}