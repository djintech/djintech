import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '@src/modules/user-accounts/auth/guards/bearer/jwt-auth.guard';
import { PostInputDto } from './input-dto/posts.input-dto';
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

@SkipThrottle()
@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  
  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiCreatePostDocs()
  @UseInterceptors(CustomFilesInterceptor)
  async createPost(
    @UserId() userId: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: PostInputDto,
  ): Promise<PostViewDto> {
    const postId = await this.commandBus.execute(new CreatePostCommand( dto, userId, files ));
    return this.queryBus.execute(new GetPostByIdQuery( postId ));
  }

  @Get('user/:id')
  @HttpCode(HttpStatus.OK)
  @ApiGetPostsByUserDocs()
  async getPostsByUserId(
    @Param('id', ParseIntPipe) id: number, 
    @Query() query: BaseQueryParams
  ): Promise<PaginatedViewDto<PostViewDto[]>>  {
    return this.queryBus.execute(new GetPostsByUserIdQuery(query, id));
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiGetPostByIdDocs()
  async getPost(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetPostByIdQuery( id ));
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiGetAllPostsDocs()
  async getAll(@Query() query: BaseQueryParams): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute(new GetPostsQuery(query));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiUpdatePostDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PostInputDto,
  ) {
    return await this.commandBus.execute( new UpdatePostCommand(userId, id, dto) );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiDeletePostDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('id', ParseIntPipe) id: number,
    @UserId() userId: number,
  ) {
    return this.commandBus.execute(new DeletePostCommand(id, userId));
 }
}
