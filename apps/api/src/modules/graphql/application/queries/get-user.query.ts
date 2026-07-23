import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FileUrlService } from '@src/core/file/file-url.service';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { UserView } from '../../dto/user.view';
import { mapUserToView } from './get-users.query';
import { UsersQueryRepository } from '../../infrastructure/queries/users.query.repository';

export class GetUserQuery {
  constructor(public userId: number) {}
}

@QueryHandler(GetUserQuery)
export class GetUserQueryHandler implements IQueryHandler<GetUserQuery, UserView> {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly fileUrlService: FileUrlService,
  ) {}

  async execute({ userId }: GetUserQuery): Promise<UserView> {
    const user = await this.usersQueryRepository.getUserById(userId);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return mapUserToView(user, this.fileUrlService);
  }
}
