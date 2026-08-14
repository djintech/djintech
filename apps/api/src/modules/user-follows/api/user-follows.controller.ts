import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '@src/modules/user-accounts/auth/guards/bearer/jwt-auth.guard';
import { UserId } from '@src/modules/user-accounts/auth/guards/decorators/param/user-id.decorator';
import { SearchUsersInputDto } from './input-dto/search-users-input.dto';
import { PaginatedUserSearchViewDto } from './view-dto/paginated-user-search-view.dto';
import { SearchUsersQuery } from '../application/queries/search-users.query';
import { ApiSearchUsersDocs } from '../swagger/search-users.swagger';
import { UserFollowInputDto } from './input-dto/user-follow-input.dto';
import { FollowUserCommand } from '../application/usecases/follow-user.usecase';
import { ApiUserFollowDocs } from '../swagger/user-follow.swagger';
import { UnfollowUserCommand } from '../application/usecases/unfollow-user.usecase';
import { ApiUserUnfollowDocs } from '../swagger/user-unfollow.swagger';

@SkipThrottle()
@Controller('users')
export class UserFollowsController {
  constructor(
    private commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  
  @Get('search')
  @ApiSearchUsersDocs()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async searchUsers(
    @UserId() userId: number,
    @Query() query: SearchUsersInputDto,
  ): Promise<PaginatedUserSearchViewDto> {
    return await this.queryBus.execute<
      SearchUsersQuery,
      PaginatedUserSearchViewDto
    >(new SearchUsersQuery(userId, query));
  }

  @Post('following')
  @ApiUserFollowDocs()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async followUser(
    @UserId() userId: number,
    @Body() body: UserFollowInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new FollowUserCommand(userId, body.selectedUserId),
    );
  }

  @Delete('following/:userId')
  @ApiUserUnfollowDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async unfollowUser(
    @UserId() userId: number,
    @Param('userId', ParseIntPipe) selectedUserId: number,
  ): Promise<void> {
    await this.commandBus.execute(
      new UnfollowUserCommand(userId, selectedUserId),
    );
  }
} 
