import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PostsQueryRepository } from "../../infrastructure/query/posts.query.repository";
import { FileUrlService } from "../../../../core/file/file-url.service";
import { BaseQueryParams, SortDirection } from "@src/core/dto/base.query-params.input-dto";
import { PaginatedViewDto } from "@src/core/dto/base.paginated.view-dto";
import { MAIN_PAGE_SIZE } from "../../constants";
import { CommentViewDto } from "../../api/view-dto/comment.view-dto";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { CommentsQueryRepository } from "../../infrastructure/query/comments.query.repository";

export class GetCommentsQuery {
  constructor(
    public query: BaseQueryParams,
    public readonly userId: number,
    public readonly postId: number,
  ) {}
}

@QueryHandler(GetCommentsQuery)
export class GetCommentsQueryHandler
  implements IQueryHandler<GetCommentsQuery, PaginatedViewDto<CommentViewDto[]> >
{
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private readonly fileUrlService: FileUrlService
  ) {}

  async execute({ query, userId, postId }: GetCommentsQuery): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const post = await this.postsQueryRepository.findPostById( postId );
    
    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }

    const { pageNumber, pageSize, sortDirection } = query;
    const pageSizeValue = pageSize ?? MAIN_PAGE_SIZE;
    const order = sortDirection === SortDirection.Asc ? SortDirection.Asc : SortDirection.Desc;

    const {comments, totalCount} = await this.commentsQueryRepository.getAll({ 
      order,
      skip: query.calculateSkip(),
      pageSize: pageSizeValue,
      postId,
      userId
    });

    return PaginatedViewDto.mapToView({
      page: pageNumber,
      size: pageSizeValue,
      totalCount,
      items: comments.map( comment => CommentViewDto.mapToView(comment, this.fileUrlService.getPublicUrl.bind(this.fileUrlService)) ),
    });
}
}