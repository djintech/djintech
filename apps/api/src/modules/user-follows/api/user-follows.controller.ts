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
import { GetUserFollowersInputDto } from './input-dto/get-user-followers-input.dto';
import { GetUserFollowingInputDto } from './input-dto/get-user-following-input.dto';
import { ApiGetUserProfileDocs } from '../swagger/get-user-profile.swagger';
import { UserProfileViewDto } from './view-dto/user-profile-view.dto';
import { GetUserProfileQuery } from '../application/queries/get-user-profile.query';
import { ApiGetUserFollowersDocs } from '../swagger/get-user-followers.swagger';
import { PaginatedUserFollowViewDto } from './view-dto/paginated-user-follow-view.dto';
import { GetUserFollowersQuery } from '../application/queries/get-user-followers.query';
import { ApiGetUserFollowingDocs } from '../swagger/get-user-following.swagger';
import { GetUserFollowingQuery } from '../application/queries/get-user-following.query';

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

  @Get('/:userName')
  @ApiGetUserProfileDocs()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getUserProfile(
    @UserId() userId: number,
    @Param('userName') userName: string,
  ): Promise<UserProfileViewDto> {
    return await this.queryBus.execute< GetUserProfileQuery, UserProfileViewDto >(
      new GetUserProfileQuery(userId, userName));
  }

  @Get('/:userName/followers')
  @ApiGetUserFollowersDocs()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getUserFollowers(
    @UserId() userId: number,
    @Param('userName') userName: string,
    @Query() query: GetUserFollowersInputDto,
  ): Promise<PaginatedUserFollowViewDto> {
    return await this.queryBus.execute< GetUserFollowersQuery, PaginatedUserFollowViewDto >(
      new GetUserFollowersQuery(userId, userName, query));
  }

  @Get('/:userName/following')
  @ApiGetUserFollowingDocs()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getUserFollowing(
    @UserId() userId: number,
    @Param('userName') userName: string,
    @Query() query: GetUserFollowingInputDto,
  ): Promise<PaginatedUserFollowViewDto> {
    return await this.queryBus.execute< GetUserFollowingQuery, PaginatedUserFollowViewDto >(
      new GetUserFollowingQuery(userId, userName, query));
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
