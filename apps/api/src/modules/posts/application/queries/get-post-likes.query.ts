import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PostsQueryRepository } from "../../infrastructure/query/posts.query.repository";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { FileUrlService } from "../../../../core/file/file-url.service";
import { BasePaginatedWithCursorViewDto } from "@src/core/dto/base-paginated-with-cursor-view.dto";
import { UserFollowViewDto } from "@src/modules/user-follows/api/view-dto/user-follow-view.dto";
import { BasePaginationInputDto } from "@src/core/dto/base.paginated-with-cursor.view-dto";
import { PostLikesQueryRepository } from "../../infrastructure/query/post-likes.query.repository";

export class GetPostLikesQuery {
  constructor(
    public id: number,
    public userId: number,
    public query: BasePaginationInputDto
  ) {}
}

@QueryHandler(GetPostLikesQuery)
export class GetPostLikesQueryHandler
  implements IQueryHandler<GetPostLikesQuery, BasePaginatedWithCursorViewDto<UserFollowViewDto[]>>
{
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private postLikesQueryRepository: PostLikesQueryRepository,
    private readonly fileUrlService: FileUrlService
  ) {}

  async execute({ id, userId, query }: GetPostLikesQuery): Promise<BasePaginatedWithCursorViewDto<UserFollowViewDto[]>> {
    const post = await this.postsQueryRepository.findPostById( id );

    if ( !post ){
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
        extensions: [{ message: 'Post not found', field: 'post' }],
      });      
    }

    const likes = await this.postLikesQueryRepository.getPostLikes( 
      {
        postId: id,
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
