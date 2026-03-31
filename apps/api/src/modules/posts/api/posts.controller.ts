import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiConsumes, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiQuery, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '@src/modules/user-accounts/guards/bearer/jwt-auth.guard';
import { CreatePostInputDto } from './input-dto/posts.input-dto';
import { ErrorResponseDto } from '@src/core/error-dto/error-response.dto';
import { PostViewDto } from './view-dto/posts.view-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/usecases/create-post.usecase';
import { UserId } from '@src/modules/user-accounts/guards/decorators/param/user-id.decorator';
import { CreatePostWithFilesDto } from './input-dto/posts-with-files.input-dto';
import { CustomFilesInterceptor } from '../interseptors/custom-files.interceptor';
import { GetPostByIdQuery } from '../application/queries/get-post-by-id.query';
import { BaseQueryParams } from '@src/core/dto/base.query-params.input-dto';
import { GetPostsByUserIdQuery } from '../application/queries/get-posts-by-user-id.query';
import { PaginatedViewDto } from '@src/core/dto/base.paginated.view-dto';

@SkipThrottle()
@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('JwtAuth')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: CreatePostWithFilesDto })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ type: PostViewDto, description: 'The post has been successfully created. The response body contains the post data' })
  @ApiBadRequestResponse({ description: 'The inputModel has incorrect values', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Post not found', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized'})
  @UseInterceptors(CustomFilesInterceptor)
  async createPost(
    @UserId() userId: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: CreatePostInputDto,
  ): Promise<PostViewDto> {
    const postId = await this.commandBus.execute(new CreatePostCommand( dto, userId, files ));
    return this.queryBus.execute(new GetPostByIdQuery( postId ));
  }

  @Get('user/:id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'user ID' })
  @ApiOkResponse({ type: [PostViewDto], description: 'success' })
  async getPostsByUserId(
    @Param('id', ParseIntPipe) id: number, 
    @Query() query: BaseQueryParams
  ): Promise<PaginatedViewDto<PostViewDto[]>>  {
    return this.queryBus.execute(new GetPostsByUserIdQuery(query, id));
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'post ID' })
  @ApiOkResponse({ type: PostViewDto, description: 'The response body contains the post data' })
  @ApiNotFoundResponse({ description: 'Post not found', type: ErrorResponseDto })
  async getPost(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetPostByIdQuery( id ));
  }

//   @Get()
//   @HttpCode(HttpStatus.OK)
//   //@PostsSwagger.getPosts()
//   async getPosts(@Query() query: BaseQueryParams) {
//     return this.queryBus.execute(new GetPostsQuery(query));
//   }

//   @Put(':id')
//   @UseGuards(JwtAuthGuard)
//   @HttpCode(HttpStatus.NO_CONTENT)
//   //@UseInterceptors(FilesInterceptor('images', MAX_IMAGES_COUNT))
//  // @PostsSwagger.updatePost()
//   async updatePost(
//     @GetUserFromRequest() user: UserContextDto,
//     @Param('id') id: string,
//     @UploadedFiles()
//     images: Express.Multer.File[],
//     @Body() dto: UpdatePostInputDto,
//   ) {
//     return await this.commandBus.execute<UpdatePostCommand>(
//       new UpdatePostCommand(user.userId, id, dto, images),
//     );
//   }

//   @Delete(':id')
//   @UseGuards(JwtAuthGuard)
//   //@PostsSwagger.deletePost()
//   @HttpCode(HttpStatus.NO_CONTENT)
//   async deletePost(
//     @Param('id') id: string,
//     @GetUserFromRequest() user: UserContextDto,
//   ) {
//     return this.commandBus.execute(new DeletePostCommand(id, user.userId));
//  }
}
