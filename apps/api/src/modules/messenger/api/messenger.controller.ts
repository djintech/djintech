import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Put, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SkipThrottle } from '@nestjs/throttler';
import { BasePaginationInputDto } from '@src/core/dto/base.paginated-with-cursor.view-dto';
import { JwtAuthGuard } from '@src/modules/user-accounts/auth/guards/bearer/jwt-auth.guard';
import { UserId } from '@src/modules/user-accounts/auth/guards/decorators/param/user-id.decorator';
import { GetMessagesParamsDto } from './input-dto/get-messages.input-dto';
import { GetMessagesQuery } from '../application/queries/get-messages.query';
import { GetDialogueByIdQuery } from '../application/queries/get-dialogue-by-id.query';
import { ApiGetMessagesDocs } from '../swagger/get-messages.swagger';
import { ApiGetDialogueByIdDocs } from '../swagger/get-dealogue-by-id.swagger';
import { UpdateMessageStatusDto } from './input-dto/update-message-statuses.input-dto';
import { DeleteMessageCommand } from '../application/usecases/delete-message.usecase';
import { ApiDeleteMessageDocs } from '../swagger/delete-messages.swagger';
import { ApiUpdateMessageStatusDocs } from '../swagger/update-message-status.swagger';
import { UpdateMessageStatusCommand } from '../application/usecases/update-message-status.usecase';
import { MessengerService } from '../application/services/messenger.service';
import { Message } from '@src/generated/prisma/client';

@SkipThrottle()
@Controller('messenger')
export class MessengerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly messengerService: MessengerService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiGetMessagesDocs()
  async getMessages(
    @Query() query: GetMessagesParamsDto,
    @UserId() userId: number,
  ) {
    return this.queryBus.execute( new GetMessagesQuery(userId, query ));
  }

  @Get('/:dialoguePartnerId')
  @UseGuards(JwtAuthGuard)
  @ApiGetDialogueByIdDocs()
  async getDialogueById(
    @Param('dialoguePartnerId', ParseIntPipe) dialoguePartnerId: number,
    @Query() query: BasePaginationInputDto,
    @UserId() userId: number,
  ) {
    return this.queryBus.execute( new GetDialogueByIdQuery( userId, dialoguePartnerId, query ));
  }

  @Put('')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(JwtAuthGuard)
  @ApiUpdateMessageStatusDocs()
  async updateMessageStatus(
    @Body() dto: UpdateMessageStatusDto,
    @UserId() userId: number,
  ) {
    const updatedMessages = await this.commandBus.execute<
      UpdateMessageStatusCommand,
      Message[]
    >( new UpdateMessageStatusCommand( userId, dto.ids ));

    for (const message of updatedMessages) {
      this.messengerService.sendMessageUpdated(message);
    }
    return;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiDeleteMessageDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMessage(
    @Param('id', ParseIntPipe) id: number,
    @UserId() userId: number,
  ) {
    const deletedMessage = await this.commandBus.execute(new DeleteMessageCommand(id, userId));
    this.messengerService.sendMessageDeleted(deletedMessage);
  }
}
