import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
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
import { BannedUserGuard } from '@src/modules/user-accounts/auth/guards/banned-user.guard';
import { MessageViewDto } from './view-dto/message.view-dto';
import { ImageInputDto } from './input-dto/image.input-dto';
import { ApiCreateImageDocs } from '../swagger/create-image.swagger';
import { CustomFileInterceptor } from '../interseptors/custom-file.interceptor';
import { MessageWithMedia } from '../infrastructure/types/message-with-media.type';
import { CreateImageMessageCommand } from '../application/usecases/create-image-message.usecase';

@Controller('messenger')
export class MessengerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly messengerService: MessengerService,
  ) {}

  @SkipThrottle()
  @Get()
  @UseGuards(JwtAuthGuard, BannedUserGuard)
  @ApiGetMessagesDocs()
  async getMessages(
    @Query() query: GetMessagesParamsDto,
    @UserId() userId: number,
  ) {
    return this.queryBus.execute( new GetMessagesQuery(userId, query ));
  }

  @SkipThrottle()
  @Get('/:dialoguePartnerId')
  @UseGuards(JwtAuthGuard, BannedUserGuard)
  @ApiGetDialogueByIdDocs()
  async getDialogueById(
    @Param('dialoguePartnerId', ParseIntPipe) dialoguePartnerId: number,
    @Query() query: BasePaginationInputDto,
    @UserId() userId: number,
  ) {
    return this.queryBus.execute( new GetDialogueByIdQuery( userId, dialoguePartnerId, query ));
  }

  @SkipThrottle()
  @Put('')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(JwtAuthGuard, BannedUserGuard)
  @ApiUpdateMessageStatusDocs()
  async updateMessageStatus(
    @Body() dto: UpdateMessageStatusDto,
    @UserId() userId: number,
  ) {
    const updatedMessages = await this.commandBus.execute<
      UpdateMessageStatusCommand,
      MessageWithMedia[]
    >( new UpdateMessageStatusCommand( userId, dto.ids ));

    for (const message of updatedMessages) {
      this.messengerService.sendMessageUpdated(message);
    }
    return;
  }

  @SkipThrottle()
  @Delete(':id')
  @UseGuards(JwtAuthGuard, BannedUserGuard)
  @ApiDeleteMessageDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMessage(
    @Param('id', ParseIntPipe) id: number,
    @UserId() userId: number,
  ) {
    const deletedMessage = await this.commandBus.execute(new DeleteMessageCommand(id, userId));
    this.messengerService.sendMessageDeleted(deletedMessage);
  }
   
  @Post('/:receiverId/image')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, BannedUserGuard)
  @ApiCreateImageDocs()
  @UseInterceptors(CustomFileInterceptor)
  async createImage(
    @UserId() userId: number,
    @Param('receiverId', ParseIntPipe) receiverId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ImageInputDto,
  ): Promise<MessageViewDto> {
    const message = await this.commandBus.execute(new CreateImageMessageCommand( dto.message, userId, receiverId, file ));

    this.messengerService.sendMessage( message );
    
    return message;
  }
}
