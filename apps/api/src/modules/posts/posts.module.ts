import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePostUseCase } from './application/usecases/create-post.usecase';
import { GetPostByIdQueryHandler } from './application/queries/get-post-by-id.query';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { PostsController } from './api/posts.controller';
import { PostsRepository } from './infrastructure/posts.repository';
import { PostsQueryRepository } from './infrastructure/query/posts.query.repository';
import { FilesConfig } from '@src/config/files/files.config';
import { FileUrlService } from './infrastructure/services/file-url.service';
import { GetPostsByUserIdQueryHandler } from './application/queries/get-posts-by-user-id.query';

const commandHandlers = [
  CreatePostUseCase,
];

const queryHandlers = [
  GetPostByIdQueryHandler,
  GetPostsByUserIdQueryHandler,
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
    FileUrlService,
  ],
})
export class PostModule {}