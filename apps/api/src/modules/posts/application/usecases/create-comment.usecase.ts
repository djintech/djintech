import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateCommentDto } from "../dto/create-comment";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { PostsQueryRepository } from "../../infrastructure/query/posts.query.repository";
import { CommentViewDto } from "../../api/view-dto/comment.view-dto";
import { FileUrlService } from "@src/core/file/file-url.service";
import { CommentsRepository } from "../../infrastructure/comments.repository";

export class CreateCommentCommand {
  constructor(
    public readonly dto: CreateCommentDto,
    public readonly userId: number,
    public readonly postId: number,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand, CommentViewDto>
{
  constructor( 
    private postsQueryRepository: PostsQueryRepository,
    private commentsRepository: CommentsRepository,
    private readonly fileUrlService: FileUrlService,
  ) {}

  async execute({ dto, userId, postId }: CreateCommentCommand): Promise<CommentViewDto> {
    const post = await this.postsQueryRepository.findPostById(postId);

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }

    const createdComment = await this.commentsRepository.create({ content: dto.content, userId, postId });
    const comment = await this.commentsRepository.findByIdForView( createdComment.id, userId );

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }

    return CommentViewDto.mapToView(
      comment,
      this.fileUrlService.getPublicUrl.bind(this.fileUrlService),
    );
  }
}
 