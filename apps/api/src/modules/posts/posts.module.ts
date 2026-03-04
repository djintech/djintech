import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePostUseCase } from './application/usecases/create-post.usecase';
import { GetPostByIdQueryHandler } from './application/queries/get-post-by-id.query';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { PostsController } from './api/posts.controller';
import { PostsRepository } from './infrastructure/posts.repository';
import { PostsQueryRepository } from './infrastructure/query/posts.query.repository';

const commandHandlers = [
  CreatePostUseCase,
];

const queryHandlers = [
  GetPostByIdQueryHandler,
];

@Module({
  imports: [
    CqrsModule,
    UserAccountsModule,
  ],
  controllers: [
    PostsController,
  ],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    PostsRepository,
    PostsQueryRepository,
  ],
})
export class PostModule {}