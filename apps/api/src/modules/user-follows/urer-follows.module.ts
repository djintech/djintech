import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { UserFollowsController } from './api/user-follows.controller';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { SearchUsersQueryHandler } from './application/queries/search-users.query';
import { FollowUserUseCase } from './application/usecases/follow-user.usecase';
import { UserFollowRepository } from './infrastructure/user-follow.repository';
import { UnfollowUserUseCase } from './application/usecases/unfollow-user.usecase';

const commandHandlers = [
  FollowUserUseCase,
  UnfollowUserUseCase,
];

const queryHandlers = [
  SearchUsersQueryHandler,
];

@Module({
  imports: [
    CqrsModule,
    UserAccountsModule,
  ],
  controllers: [
    UserFollowsController,
  ],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    UsersQueryRepository,
    UserFollowRepository,
  ],
})
export class UserFollowsModule {}