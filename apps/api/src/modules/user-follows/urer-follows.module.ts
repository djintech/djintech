import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { UserFollowsController } from './api/user-follows.controller';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { SearchUsersQueryHandler } from './application/queries/search-users.query';

const commandHandlers = [
  SearchUsersQueryHandler,
];

const queryHandlers = [

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
  ],
})
export class UserFollowsModule {}