import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { BaseQueryParams, SortDirection } from "@src/core/dto/base.query-params.input-dto";
import { PostViewDto } from "../../api/view-dto/posts.view-dto";
import { PostsQueryRepository } from "../../infrastructure/query/posts.query.repository";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";
import { FileUrlService } from "../../infrastructure/services/file-url.service";
import { PaginatedViewDto } from "@src/core/dto/base.paginated.view-dto";

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
    const order = sortDirection === SortDirection.Asc ? SortDirection.Asc : SortDirection.Desc;
    const {posts, totalCount} = await this.postsQueryRepository.findPostsByUserId({ 
      userId: id,
      order,
      skip: query.calculateSkip(),
      pageSize
    });

    return PaginatedViewDto.mapToView({
      page: pageNumber,
      size: pageSize,
      totalCount,
      items: posts.map(post => PostViewDto.mapToView(post, this.fileUrlService.getPublicUrl)),
    });
}
}
