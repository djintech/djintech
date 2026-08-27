import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { FileUrlService } from "../../../../core/file/file-url.service";
import { BasePaginatedWithCursorViewDto } from "@src/core/dto/base-paginated-with-cursor-view.dto";
import { UserFollowViewDto } from "@src/modules/user-follows/api/view-dto/user-follow-view.dto";
import { BasePaginationInputDto } from "@src/core/dto/base.paginated-with-cursor.view-dto";
import { CommentsRepository } from "../../infrastructure/comments.repository";
import { CommentLikesQueryRepository } from "../../infrastructure/query/comment-likes.query.repository";

export class GetCommentLikesQuery {
  constructor(
    public postId: number,
    public commentId: number,
    public userId: number,
    public query: BasePaginationInputDto
  ) {}
}

@QueryHandler(GetCommentLikesQuery)
export class GetCommentLikesQueryHandler
  implements IQueryHandler<GetCommentLikesQuery, BasePaginatedWithCursorViewDto<UserFollowViewDto[]>>
{
  constructor(
    private commentsRepository: CommentsRepository,
    private commentLikesQueryRepository: CommentLikesQueryRepository,
    private readonly fileUrlService: FileUrlService
  ) {}

  async execute({ postId, commentId, userId, query }: GetCommentLikesQuery): Promise<BasePaginatedWithCursorViewDto<UserFollowViewDto[]>> {
    const comment = await this.commentsRepository.findCommentByIdAndPostId( commentId, postId);

    if ( !comment ){
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post comment not found',
        extensions: [{ message: 'Post comment not found', field: 'comment' }],
      });      
    }

    const likes = await this.commentLikesQueryRepository.getCommentLikes( 
      {
        commentId,
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
