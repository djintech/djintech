import { SearchUsersInputDto } from "../../api/input-dto/search-users-input.dto";
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from "../../infrastructure/query/users.query-repository";
import { PaginatedUserSearchViewDto } from "../../api/view-dto/paginated-user-search-view.dto";
import { FileUrlService } from "@src/core/file/file-url.service";

export class SearchUsersQuery {
  constructor( 
    public readonly userId: number,
    public readonly input: SearchUsersInputDto, 
  ) {}
}

@QueryHandler(SearchUsersQuery)
export class SearchUsersQueryHandler
  implements IQueryHandler<SearchUsersQuery>
{
  constructor(
    private readonly userSearchRepository: UsersQueryRepository,
    private readonly fileUrlService: FileUrlService,
  ) {}

  async execute( {userId, input}: SearchUsersQuery, ): Promise<PaginatedUserSearchViewDto> {
    const pageSize = 12;
    const result = await this.userSearchRepository.searchUsers({
      username: input.username,
      cursor: input.cursor,
      pageSize,
    });

    const buildUrl = this.fileUrlService.getPublicUrl.bind( this.fileUrlService );

    return PaginatedUserSearchViewDto.mapToView(
      result,
      input.cursor ?? null,
      pageSize,
      buildUrl,
    );    
  }
}