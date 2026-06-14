import { Controller, Delete, HttpCode, HttpStatus, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '@src/modules/user-accounts/auth/guards/bearer/jwt-auth.guard';
import { UserId } from '@src/modules/user-accounts/auth/guards/decorators/param/user-id.decorator';

@SkipThrottle()
@Controller('notifications')
export class NotificationsController {
  constructor(
    private commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  
  @Put('mark-as-read')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(JwtAuthGuard)
  //@ApiCreatePostDocs()
  async markAsRead( @UserId() userId: number) {
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  //@ApiDeletePostDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNotification(
    @Param('id', ParseIntPipe) id: number,
    @UserId() userId: number,
  ) {
    //return this.commandBus.execute(new DeletePostCommand(id, userId));
 }
}
