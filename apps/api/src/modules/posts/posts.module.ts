import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePostUseCase } from './application/usecases/create-post.usecase';
import { GetPostByIdQueryHandler } from './application/queries/get-post-by-id.query';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { PostsController } from './api/posts.controller';
import { PostsRepository } from './infrastructure/posts.repository';
import { PostsQueryRepository } from './infrastructure/query/posts.query.repository';
import { FilesConfig } from '@src/config/files/files.config';
import { GetPostsByUserIdQueryHandler } from './application/queries/get-posts-by-user-id.query';
import { GetPostsQueryHandler } from './application/queries/get-posts.query';
import { DeletePostUseCase } from './application/usecases/delete-post.usecase';
import { UpdatePostUseCase } from './application/usecases/update-post.usecase';

const commandHandlers = [
  CreatePostUseCase,
  DeletePostUseCase,
  UpdatePostUseCase,
];

const queryHandlers = [
  GetPostByIdQueryHandler,
  GetPostsByUserIdQueryHandler,
  GetPostsQueryHandler,
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
    FilesConfig,
  ],
})
export class PostModule {}