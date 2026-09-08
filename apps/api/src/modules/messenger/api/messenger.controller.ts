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

@SkipThrottle()
@Controller('messenger')
export class MessengerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
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

  // @Put('')
  // @HttpCode(HttpStatus.ACCEPTED)
  // @UseGuards(JwtAuthGuard)
  // @ApiUpdateMessageStatusDocs()
  // async updateMessageStatus(
  //   @Body() dto: UpdateMessageStatusInputDto,
  //   @UserId() userId: number,
  // ) {
  //   return this.commandBus.execute(new UpdateMessageStatusCommand(userId, dto.ids));
  // }

}
