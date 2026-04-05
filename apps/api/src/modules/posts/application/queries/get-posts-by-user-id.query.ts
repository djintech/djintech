import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { BaseQueryParams, SortDirection } from "@src/core/dto/base.query-params.input-dto";
import { PostViewDto } from "../../api/view-dto/posts.view-dto";
import { PostsQueryRepository } from "../../infrastructure/query/posts.query.repository";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { FileUrlService } from "../../../../core/file/file-url.service";
import { PaginatedViewDto } from "@src/core/dto/base.paginated.view-dto";
import { USER_PROFILE_PAGE_SIZE } from "../../constants";

export class GetPostsByUserIdQuery {
  constructor(
    public query: BaseQueryParams,
    public id: number
  ) {}
}

@QueryHandler(GetPostsByUserIdQuery)
export class GetPostsByUserIdQueryHandler
  implements IQueryHandler<GetPostsByUserIdQuery, PaginatedViewDto<PostViewDto[]>>
{
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private readonly fileUrlService: FileUrlService
  ) {}

  async execute({ query, id }: GetPostsByUserIdQuery) {
    const { pageNumber, pageSize, sortDirection } = query;
    const pageSizeValue = pageSize ?? USER_PROFILE_PAGE_SIZE;
    const order = sortDirection === SortDirection.Asc ? SortDirection.Asc : SortDirection.Desc;
    const {posts, totalCount} = await this.postsQueryRepository.findPostsByUserId({ 
      userId: id,
      order,
      skip: query.calculateSkip(),
      pageSize: pageSizeValue
    });

    const buildUrl = this.fileUrlService.getPublicUrl.bind(this.fileUrlService);

    return PaginatedViewDto.mapToView({
      page: pageNumber,
      size: pageSizeValue,
      totalCount,
      items: posts.map(post => PostViewDto.mapToView(post, buildUrl)),
    });
}
}
