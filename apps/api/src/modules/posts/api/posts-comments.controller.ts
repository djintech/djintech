import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query, UseGuards, } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '@src/modules/user-accounts/auth/guards/bearer/jwt-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserId } from '@src/modules/user-accounts/auth/guards/decorators/param/user-id.decorator';
import { BaseQueryParams } from '@src/core/dto/base.query-params.input-dto';
import { PaginatedViewDto } from '@src/core/dto/base.paginated.view-dto';
import { BannedUserGuard } from '@src/modules/user-accounts/auth/guards/banned-user.guard';
import { CommentInputDto } from './input-dto/comment.input-dto';
import { CommentViewDto } from './view-dto/comment.view-dto';
import { ApiCreateCommentDocs } from '../swagger/create-comment.swagger';
import { CreateCommentCommand } from '../application/usecases/create-comment.usecase';
import { ApiGetCommentsDocs } from '../swagger/get-comments.swagger';
import { GetCommentsQuery } from '../application/queries/get-comments.query';
import { CreateAnswerCommand } from '../application/usecases/create-answer.usecase';
import { ApiCreateAnswerDocs } from '../swagger/create-answer.swagger';
import { AnswerViewDto } from './view-dto/answer.view-dto';
import { ApiGetAnswersDocs } from '../swagger/get-answer.swagger';
import { GetAnswersQuery } from '../application/queries/get-answers.query';
import { UpdateCommentLikeStatusInputDto } from './input-dto/update-comment-like-status.input-dto';
import { ApiUpdateCommentLikeStatusDocs } from '../swagger/update-comment-like-status.swagger';
import { ApiUpdateAnswerLikeStatusDocs } from '../swagger/update-answer-like-status.swagger';
import { UpdateCommentLikeStatusCommand } from '../application/usecases/update-comment-like-status.usecase';
import { UpdateAnswerLikeStatusCommand } from '../application/usecases/update-answer-like-status.usecase';
import { BasePaginationInputDto } from '@src/core/dto/base.paginated-with-cursor.view-dto';
import { BasePaginatedWithCursorViewDto } from '@src/core/dto/base-paginated-with-cursor-view.dto';
import { UserFollowViewDto } from '@src/modules/user-follows/api/view-dto/user-follow-view.dto';
import { ApiGetCommentLikesDocs } from '../swagger/get-comment-likes.swagger';
import { ApiGetAnswerLikesDocs } from '../swagger/get-answer-likes.swagger';
import { GetCommentLikesQuery } from '../application/queries/get-comment-likes.query';
import { GetAnswerLikesQuery } from '../application/queries/get-answer-likes.query';

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

  @Post(':postId/comments/:commentId/answers')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, BannedUserGuard)
  @ApiCreateAnswerDocs()
  async createAnswer(
    @UserId() userId: number,
    @Param('postId', ParseIntPipe) postId: number, 
    @Param('commentId', ParseIntPipe) commentId: number, 
    @Body() dto: CommentInputDto,
  ): Promise<AnswerViewDto> {
    return  this.commandBus.execute(new CreateAnswerCommand( dto, userId, postId, commentId ));    
  }

  @Get(':postId/comments/:commentId/answers')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, BannedUserGuard)
  @ApiGetAnswersDocs()
  async getAnswers(
    @UserId() userId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,  
    @Query() query: BaseQueryParams,
  ): Promise<PaginatedViewDto<AnswerViewDto[]>> {
    return  this.queryBus.execute(new GetAnswersQuery( query, userId, postId, commentId ));    
  }

  @Put(':postId/comments/:commentId/like-status')
  @UseGuards(JwtAuthGuard, BannedUserGuard)
  @ApiUpdateCommentLikeStatusDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateCommentLikeStatus(
    @UserId() userId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,  
    @Body() dto: UpdateCommentLikeStatusInputDto,
  ) {
    return await this.commandBus.execute( new UpdateCommentLikeStatusCommand(userId, postId, commentId, dto) );
  }

  @Put(':postId/comments/:commentId/answers/:answerId/like-status')
  @UseGuards(JwtAuthGuard, BannedUserGuard)
  @ApiUpdateAnswerLikeStatusDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateAnswerLikeStatus(
    @UserId() userId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,  
    @Param('answerId', ParseIntPipe) answerId: number,  
    @Body() dto: UpdateCommentLikeStatusInputDto,
  ) {
    return await this.commandBus.execute( new UpdateAnswerLikeStatusCommand(userId, postId, commentId, answerId, dto) );
  }
  
  @Get(':postId/comments/:commentId/likes')
  @UseGuards(JwtAuthGuard, BannedUserGuard)
  @HttpCode(HttpStatus.OK)
  @ApiGetCommentLikesDocs()
  async getCommentLikes(
    @UserId() userId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,  
    @Query() query: BasePaginationInputDto
  ): Promise<BasePaginatedWithCursorViewDto<UserFollowViewDto[]>> {
    return this.queryBus.execute(new GetCommentLikesQuery( postId, commentId, userId, query ));
  }
  
  @Get(':postId/comments/:commentId/answers/:answerId/likes')
  @UseGuards(JwtAuthGuard, BannedUserGuard)
  @HttpCode(HttpStatus.OK)
  @ApiGetAnswerLikesDocs()
  async getAnswerLikes(
    @UserId() userId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,  
    @Param('answerId', ParseIntPipe) answerId: number, 
    @Query() query: BasePaginationInputDto
  ): Promise<BasePaginatedWithCursorViewDto<UserFollowViewDto[]>> {
    return this.queryBus.execute(new GetAnswerLikesQuery( postId, commentId, answerId, userId, query ));
  }
}
