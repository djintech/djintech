import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Put, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '@src/modules/user-accounts/auth/guards/bearer/jwt-auth.guard';
import { UserId } from '@src/modules/user-accounts/auth/guards/decorators/param/user-id.decorator';
import { GetNotificationsParamsDto } from './input-dto/get-notifications-params.dto';
import { MarkAsReadInputDto } from './input-dto/mark-as-read.input-dto';
import { GetNotificationsQuery } from '../application/queries/get-notifications.query';
import { MarkAsReadCommand } from '../application/usecases/mark-as-read.usecase';
import { DeleteNotificationCommand } from '../application/usecases/delete-notification.usecase';
import { SortDirection } from '@src/core/dto/base.query-params.input-dto';
import { ApiDeleteNotificationDocs } from '../swagger/delete-notification.swagger';
import { ApiMarkAsReadDocs } from '../swagger/mark-as-read.swagger';
import { ApiGetNotificationDocs } from '../swagger/get-notifications.swagger';

@SkipThrottle()
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(':cursor')
  @UseGuards(JwtAuthGuard)
  @ApiGetNotificationDocs()
  async getNotifications(
    @Param('cursor', ParseIntPipe) cursor: number,
    @Query() query: GetNotificationsParamsDto,
    @UserId() userId: number,
  ) {
    return this.queryBus.execute(
      new GetNotificationsQuery({
        userId, 
        cursor, 
        pageSize: query.pageSize ?? 12,
        isRead: query.isRead,
        sortDirection: query.sortDirection ?? SortDirection.Desc,
      }),
    );
  }

  @Put('mark-as-read')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(JwtAuthGuard)
  @ApiMarkAsReadDocs()
  async markAsRead(
    @Body() dto: MarkAsReadInputDto,
    @UserId() userId: number,
  ) {
    return this.commandBus.execute(new MarkAsReadCommand(userId, dto.ids));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiDeleteNotificationDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNotification(
    @Param('id', ParseIntPipe) id: number,
    @UserId() userId: number,
  ) {
    return this.commandBus.execute(new DeleteNotificationCommand(id, userId));
  }
}
