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
import { PostsCommentsController } from './api/posts-comments.controller';
import { CreateCommentUseCase } from './application/usecases/create-comment.usecase';
import { CommentsRepository } from './infrastructure/comments.repository';
import { GetCommentsQueryHandler } from './application/queries/get-comments.query';
import { CommentsQueryRepository } from './infrastructure/query/comments.query.repository';
import { CreateAnswerUseCase } from './application/usecases/create-answer.usecase';
import { GetAnswersQueryHandler } from './application/queries/get-answers.query';
import { UpdatePostLikeStatusUseCase } from './application/usecases/update-post-like-status.usecase';
import { PostLikesRepository } from './infrastructure/post-likes.repository';
import { UpdateCommentLikeStatusUseCase } from './application/usecases/update-comment-like-status.usecase';
import { CommentLikesRepository } from './infrastructure/comment-likes.repository';
import { UpdateAnswerLikeStatusUseCase } from './application/usecases/update-answer-like-status.usecase';
import { GetPostLikesQueryHandler } from './application/queries/get-post-likes.query';
import { PostLikesQueryRepository } from './infrastructure/query/post-likes.query.repository';
import { GetCommentLikesQueryHandler } from './application/queries/get-comment-likes.query';
import { GetAnswerLikesQueryHandler } from './application/queries/get-answer-likes.query';
import { CommentLikesQueryRepository } from './infrastructure/query/comment-likes.query.repository';
import { GetFeedQueryHandler } from './application/queries/get-feed.query';

const commandHandlers = [
  CreatePostUseCase,
  DeletePostUseCase,
  UpdatePostUseCase,
  CreateCommentUseCase,
  CreateAnswerUseCase,
  UpdatePostLikeStatusUseCase,
  UpdateCommentLikeStatusUseCase,
  UpdateAnswerLikeStatusUseCase,
];

const queryHandlers = [
  GetPostByIdQueryHandler,
  GetPostsByUserIdQueryHandler,
  GetPostsQueryHandler,
  GetCommentsQueryHandler,
  GetAnswersQueryHandler,
  GetPostLikesQueryHandler,
  GetCommentLikesQueryHandler,
  GetAnswerLikesQueryHandler,
  GetFeedQueryHandler,
];

@Module({
  imports: [
    CqrsModule,
    UserAccountsModule,
  ],
  controllers: [
    PostsController,
    PostsCommentsController,
  ],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    PostsRepository,
    PostsQueryRepository,
    CommentsRepository,
    CommentsQueryRepository,
    PostLikesRepository,
    PostLikesQueryRepository,
    CommentLikesRepository,
    CommentLikesQueryRepository,
    FilesConfig,
  ],
})
export class PostModule {}