import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '@src/modules/user-accounts/auth/guards/bearer/jwt-auth.guard';
import { PostInputDto, PostInputUpdateDto } from './input-dto/posts.input-dto';
import { PostViewDto } from './view-dto/posts.view-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/usecases/create-post.usecase';
import { UserId } from '@src/modules/user-accounts/auth/guards/decorators/param/user-id.decorator';
import { CustomFilesInterceptor } from '../interseptors/custom-files.interceptor';
import { GetPostByIdQuery } from '../application/queries/get-post-by-id.query';
import { BaseQueryParams } from '@src/core/dto/base.query-params.input-dto';
import { GetPostsByUserIdQuery } from '../application/queries/get-posts-by-user-id.query';
import { PaginatedViewDto } from '@src/core/dto/base.paginated.view-dto';
import { GetPostsQuery } from '../application/queries/get-posts.query';
import { DeletePostCommand } from '../application/usecases/delete-post.usecase';
import { UpdatePostCommand } from '../application/usecases/update-post.usecase';
import { ApiCreatePostDocs } from '../swagger/create-post.swagger';
import { ApiGetPostsByUserDocs } from '../swagger/get-posts-by-user.swagger';
import { ApiGetPostByIdDocs } from '../swagger/get-post-by-id.swagger';
import { ApiGetAllPostsDocs } from '../swagger/get-all-posts.swagger';
import { ApiDeletePostDocs } from '../swagger/delete-post.swagger';
import { ApiUpdatePostDocs } from '../swagger/update-post.swagger';
import { BannedUserGuard } from '@src/modules/user-accounts/auth/guards/banned-user.guard';
import { UpdatePostLikeStatusInputDto } from './input-dto/update-post-like-status.input-dto';
import { ApiUpdatePostLikeStatusDocs } from '../swagger/update-post-like-status.swagger';
import { UpdatePostLikeStatusCommand } from '../application/usecases/update-post-like-status.usecase';
import { BasePaginationInputDto } from '@src/core/dto/base.paginated-with-cursor.view-dto';
import { ApiGetPostLikesDocs } from '../swagger/get-post-likes.swagger';
import { BasePaginatedWithCursorViewDto } from '@src/core/dto/base-paginated-with-cursor-view.dto';
import { UserFollowViewDto } from '@src/modules/user-follows/api/view-dto/user-follow-view.dto';
import { GetPostLikesQuery } from '../application/queries/get-post-likes.query';
import { OptionalJwtGuard } from '@src/modules/user-accounts/auth/guards/bearer/jwt-optional.quard';
import { GetFeedQuery } from '../application/queries/get-feed.query';
import { ApiGetFeedDocs } from '../swagger/get-feed.swagger';
import { FeedViewDto } from './view-dto/feed.view-dto';

@SkipThrottle()
@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  
  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, BannedUserGuard)
  @ApiCreatePostDocs()
  @UseInterceptors(CustomFilesInterceptor)
  async createPost(
    @UserId() userId: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: PostInputDto,
  ): Promise<PostViewDto> {
    const postId = await this.commandBus.execute(new CreatePostCommand( dto, userId, files ));
    return this.queryBus.execute(new GetPostByIdQuery( postId, userId ));
  }

  @Get('user/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalJwtGuard)
  @ApiGetPostsByUserDocs()
  async getPostsByUserId(
    @Param('id', ParseIntPipe) id: number, 
    @Query() query: BaseQueryParams,
    @UserId() userId: number | undefined,
  ): Promise<PaginatedViewDto<PostViewDto[]>>  {
    return this.queryBus.execute(new GetPostsByUserIdQuery(query, id, userId));
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard, BannedUserGuard)
  @HttpCode(HttpStatus.OK)
  @ApiGetFeedDocs()
  async getFeed(
    @UserId() userId: number,
    @Query() query: BasePaginationInputDto,
  ): Promise<BasePaginatedWithCursorViewDto<FeedViewDto[]>> {
    return this.queryBus.execute( new GetFeedQuery(userId, query) );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalJwtGuard)
  @ApiGetPostByIdDocs()
  async getPost(
    @Param('id', ParseIntPipe) id: number,
    @UserId() userId: number | undefined,
  ) {
    return this.queryBus.execute(new GetPostByIdQuery( id, userId ));
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalJwtGuard)
  @ApiGetAllPostsDocs()
  async getAll(
    @Query() query: BaseQueryParams,
    @UserId() userId: number | undefined,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute(new GetPostsQuery(query, userId));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, BannedUserGuard)
  @ApiUpdatePostDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PostInputUpdateDto,
  ) {
    return await this.commandBus.execute( new UpdatePostCommand(userId, id, dto) );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, BannedUserGuard)
  @ApiDeletePostDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('id', ParseIntPipe) id: number,
    @UserId() userId: number,
  ) {
    return this.commandBus.execute(new DeletePostCommand(id, userId));
 }
 
  @Put(':id/like-status')
  @UseGuards(JwtAuthGuard, BannedUserGuard)
  @ApiUpdatePostLikeStatusDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostLikeStatus(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostLikeStatusInputDto,
  ) {
    return await this.commandBus.execute( new UpdatePostLikeStatusCommand(userId, id, dto) );
  }

  @Get(':id/likes')
  @UseGuards(JwtAuthGuard, BannedUserGuard)
  @HttpCode(HttpStatus.OK)
  @ApiGetPostLikesDocs()
  async getPostLikes(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Query() query: BasePaginationInputDto
  ): Promise<BasePaginatedWithCursorViewDto<UserFollowViewDto[]>> {
    return this.queryBus.execute(new GetPostLikesQuery( id, userId, query ));
  }
}
