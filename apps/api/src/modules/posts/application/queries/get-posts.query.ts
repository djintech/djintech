import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PostViewDto } from "../../api/view-dto/posts.view-dto";
import { PostsQueryRepository } from "../../infrastructure/query/posts.query.repository";
import { FileUrlService } from "../../../../core/file/file-url.service";
import { BaseQueryParams, SortDirection } from "@src/core/dto/base.query-params.input-dto";
import { PaginatedViewDto } from "@src/core/dto/base.paginated.view-dto";
import { MAIN_PAGE_SIZE } from "../../constants";

export class GetPostsQuery {
  constructor(
    public query: BaseQueryParams,
    public userId?: number,
  ) {}
}

@QueryHandler(GetPostsQuery)
export class GetPostsQueryHandler
  implements IQueryHandler<GetPostsQuery, PaginatedViewDto<PostViewDto[]> >
{
  constructor(
    private postsQueryRepository: PostsQueryRepository,
        private readonly fileUrlService: FileUrlService
  ) {}

  async execute({ query, userId }: GetPostsQuery) {
    const { pageNumber, pageSize, sortDirection } = query;
    const pageSizeValue = pageSize ?? MAIN_PAGE_SIZE;
    const order = sortDirection === SortDirection.Asc ? SortDirection.Asc : SortDirection.Desc;
    const {posts, totalCount} = await this.postsQueryRepository.getAll({ 
      order,
      skip: query.calculateSkip(),
      pageSize: pageSizeValue
    });

    const buildUrl = this.fileUrlService.getPublicUrl.bind(this.fileUrlService);

    return PaginatedViewDto.mapToView({
      page: pageNumber,
      size: pageSizeValue,
      totalCount,
      items: posts.map(post => PostViewDto.mapToView(post, buildUrl, userId)),      
    });
}
}