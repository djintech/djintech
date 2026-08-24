import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateCommentDto } from "../dto/create-comment";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { FileUrlService } from "@src/core/file/file-url.service";
import { CommentsRepository } from "../../infrastructure/comments.repository";
import { AnswerViewDto } from "../../api/view-dto/answer.view-dto";

export class CreateAnswerCommand {
  constructor(
    public readonly dto: CreateCommentDto,
    public readonly userId: number,
    public readonly postId: number,
    public readonly commentId: number,
  ) {}
}

@CommandHandler(CreateAnswerCommand)
export class CreateAnswerUseCase
  implements ICommandHandler<CreateAnswerCommand, AnswerViewDto>
{
  constructor( 
    private commentsRepository: CommentsRepository,
    private readonly fileUrlService: FileUrlService,
  ) {}

  async execute({ dto, userId, postId, commentId }: CreateAnswerCommand): Promise<AnswerViewDto> {
    const comment = await this.commentsRepository.findCommentByIdAndPostId(commentId, postId);

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }

    const createdAnswer = await this.commentsRepository.create({ content: dto.content, userId, postId, parentId: commentId });
    const answer = await this.commentsRepository.findAnswerByIdForView( createdAnswer.id, userId );

    if (!answer) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Answer not found',
      });
    }

    return AnswerViewDto.mapToView(
      answer,
      this.fileUrlService.getPublicUrl.bind(this.fileUrlService),
    );
  }
}
 