import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserFollowersInputDto } from '../../api/input-dto/get-user-followers-input.dto';
import { PaginatedUserFollowViewDto } from '../../api/view-dto/paginated-user-follow-view.dto';
import { UserFollowQueryRepository } from '../../infrastructure/query/user-follow.query.repository';
import { FileUrlService } from '@src/core/file/file-url.service';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';

export class GetUserFollowersQuery {
  constructor(
    public readonly currentUserId: number,
    public readonly userName: string,
    public readonly query: GetUserFollowersInputDto,
  ) {}
}

@QueryHandler(GetUserFollowersQuery)
export class GetUserFollowersQueryHandler
  implements IQueryHandler<GetUserFollowersQuery>
{
  constructor(
    private readonly userFollowQueryRepository: UserFollowQueryRepository,
    private readonly fileUrlService: FileUrlService,
  ) {}

  async execute( { currentUserId, userName, query }: GetUserFollowersQuery ): Promise<PaginatedUserFollowViewDto> {
    const targetUser = await this.userFollowQueryRepository.findUserByUsername(userName);

    if (!targetUser) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found', extensions: [{ message: 'User not found', field: 'userName' }],
      });
    }

    const result = await this.userFollowQueryRepository.getFollowers( 
      {
        currentUserId,
        targetUserId: targetUser.id,
        search: query.search,
        pageSize: query.pageSize,
        cursor: query.cursor
      }
    );

    return PaginatedUserFollowViewDto.mapToView(
      result,
      this.fileUrlService.getPublicUrl.bind(this.fileUrlService),
    );
  }
}
