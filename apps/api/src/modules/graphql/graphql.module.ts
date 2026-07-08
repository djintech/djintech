// src/graphql/graphql.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { GraphQLContext } from './context/graphql-context';
import { HealthResolver } from './health.resolver';
import { AdminAuthService } from './application/services/admin-auth.service';
import { GqlAuthGuard } from './guards/gql-super-admin.guard';
import { AdminAuthResolver } from './resolvers/admin-auth.resolver';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';

@Module({
  imports: [
    UserAccountsModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      useGlobalPrefix: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
      context: ({ req, res }): GraphQLContext => ({
        req,
        res,
      }),
    }),
  ],
  providers: [
    HealthResolver,
    AdminAuthResolver,
    AdminAuthService,
    GqlAuthGuard,
  ],
})
export class GraphqlModule {}
