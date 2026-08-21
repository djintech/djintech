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
import { CommentInputDto } from './input-dto/comment.input-dto';
import { CommentViewDto } from './view-dto/comment.view-dto';
import { ApiCreateCommentDocs } from '../swagger/create-comment.swagger';
import { CreateCommentCommand } from '../application/usecases/create-comment.usecase';
import { ApiGetCommentsDocs } from '../swagger/get-comments.swagger';
import { GetCommentsQuery } from '../application/queries/get-comments.query';

@SkipThrottle()
@Controller('posts')
export class PostsCommentsController {
  constructor(
    private commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  
  @Post(':postId/comments')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, BannedUserGuard)
  @ApiCreateCommentDocs()
  async createComment(
    @UserId() userId: number,
    @Param('postId', ParseIntPipe) postId: number, 
    @Body() dto: CommentInputDto,
  ): Promise<CommentViewDto> {
    return  this.commandBus.execute(new CreateCommentCommand( dto, userId, postId ));    
  }

  @Get(':postId/comments')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, BannedUserGuard)
   @ApiGetCommentsDocs()
  async getComments(
    @UserId() userId: number,
    @Param('postId', ParseIntPipe) postId: number, 
    @Query() query: BaseQueryParams,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    return  this.queryBus.execute(new GetCommentsQuery( query, userId, postId ));    
  }

}
