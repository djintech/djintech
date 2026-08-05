// src/graphql/graphql.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { CqrsModule } from '@nestjs/cqrs';
import { GraphQLContext } from './context/graphql-context';
import { HealthResolver } from './health.resolver';
import { AdminAuthService } from './application/services/admin-auth.service';
import { GqlAuthGuard } from './guards/gql-super-admin.guard';
import { AdminAuthResolver } from './resolvers/admin-auth.resolver';
import { AdminUsersResolver } from './resolvers/admin-users.resolver';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { GetUsersQueryHandler } from './application/queries/get-users.query';
import { GetUserQueryHandler } from './application/queries/get-user.query';
import { GetPaymentsQueryHandler } from './application/queries/get-payments.query';
import { BanUserCommandHandler } from './application/commands/ban-user.command';
import { UsersQueryRepository } from './infrastructure/queries/users.query.repository';
import { UsersRepository } from './infrastructure/users.repository';
import { UnbanUserCommandHandler } from './application/commands/unban-user.command';
import { RemoveUserCommandHandler } from './application/commands/remove-user.command';
import { AdminPaymentsResolver } from './resolvers/admin-payments.resolver';
import { GetPostsQueryHandler } from './application/queries/get-posts.query';
import { AdminPostsResolver } from './resolvers/admin-posts.resolver';
import { PostsQueryRepository } from './infrastructure/queries/posts.query.repository';

const queryHandlers = [
  GetUsersQueryHandler,
  GetUserQueryHandler,
  GetPaymentsQueryHandler,
  GetPostsQueryHandler,
];

const commandHandlers = [
  BanUserCommandHandler,
  UnbanUserCommandHandler,
  RemoveUserCommandHandler,
];

@Module({
  imports: [
    CqrsModule,
    UserAccountsModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      useGlobalPrefix: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
      introspection: true,
      context: ({ req, res }): GraphQLContext => ({
        req,
        res,
      }),
    }),
  ],
  providers: [
    HealthResolver,
    AdminAuthResolver,
    AdminUsersResolver,
    AdminPaymentsResolver,
    AdminPostsResolver,
    AdminAuthService,
    GqlAuthGuard,
    ...queryHandlers,
    ...commandHandlers,
    UsersQueryRepository,
    UsersRepository,
    PostsQueryRepository,
  ],
})
export class GraphqlModule {}
