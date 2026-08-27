import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { FileUrlService } from "../../../../core/file/file-url.service";
import { BasePaginatedWithCursorViewDto } from "@src/core/dto/base-paginated-with-cursor-view.dto";
import { UserFollowViewDto } from "@src/modules/user-follows/api/view-dto/user-follow-view.dto";
import { BasePaginationInputDto } from "@src/core/dto/base.paginated-with-cursor.view-dto";
import { PostLikesQueryRepository } from "../../infrastructure/query/post-likes.query.repository";
import { CommentsRepository } from "../../infrastructure/comments.repository";
import { CommentLikesQueryRepository } from "../../infrastructure/query/comment-likes.query.repository";

export class GetAnswerLikesQuery {
  constructor(
    public postId: number,
    public commentId: number,
    public answerId: number,
    public userId: number,
    public query: BasePaginationInputDto
  ) {}
}

@QueryHandler(GetAnswerLikesQuery)
export class GetAnswerLikesQueryHandler
  implements IQueryHandler<GetAnswerLikesQuery, BasePaginatedWithCursorViewDto<UserFollowViewDto[]>>
{
  constructor(
    private commentsRepository: CommentsRepository,
    private commentLikesQueryRepository: CommentLikesQueryRepository,
    private readonly fileUrlService: FileUrlService
  ) {}

  async execute({ postId, commentId, answerId, userId, query }: GetAnswerLikesQuery): Promise<BasePaginatedWithCursorViewDto<UserFollowViewDto[]>> {
    const answer = await this.commentsRepository.findAnswerByIdAndCommentIdAndPostId( answerId, commentId, postId);

    if ( !answer ){
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post comment answer not found',
        extensions: [{ message: 'Post comment answer not found', field: 'answer' }],
      });      
    }

    const likes = await this.commentLikesQueryRepository.getCommentLikes( 
      {
        commentId: answerId,
        currentUserId: userId,
        pageSize: query.pageSize,
        cursor: query.cursor
      }
    );

    const buildUrl = this.fileUrlService.getPublicUrl.bind(this.fileUrlService);
    return BasePaginatedWithCursorViewDto.mapToView({
      prevCursor: likes.prevCursor,
      nextCursor: likes.nextCursor,
      pageSize: likes.pageSize,
      items: likes.items.map( like => UserFollowViewDto.mapToView(like, buildUrl)),
    });
}
}
