import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '@src/modules/user-accounts/auth/guards/bearer/jwt-auth.guard';
import { UserId } from '@src/modules/user-accounts/auth/guards/decorators/param/user-id.decorator';
import { SearchUsersInputDto } from './input-dto/search-users-input.dto';
import { PaginatedUserSearchViewDto } from './view-dto/paginated-user-search-view.dto';
import { SearchUsersQuery } from '../application/queries/search-users.query';
import { ApiSearchUsersDocs } from '../swagger/search-users.swagger';

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
}
 