import { Inject, Logger } from '@nestjs/common';
import { Ack, ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { CommandBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '@src/modules/user-accounts/auth/constants/auth-tokens.inject-constants';
import { SendMessageCommand } from '../application/usecases/send-message.usecase';
import { MarkMessageReceivedCommand } from '../application/usecases/mark-message-received.usecase';
import { MessengerWsEvent } from './constants/messenger-ws-events';
import { MessageSendDto } from './input-dto/message-send.input-dto';
import { MessageViewDto } from './view-dto/message.view-dto';
import { MessageReceivedDto } from './input-dto/message-received.input-dto';

type AccessTokenPayload = {
  id: number;
};

@WebSocketGateway({
  namespace: '/messenger',
  cors: {
    origin: '*',
    credentials: true,
  },
  perMessageDeflate: false,
})
export class MessengerGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(MessengerGateway.name);

  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly jwtService: JwtService,

    private readonly commandBus: CommandBus,
  ) {}

  async handleConnection( client: Socket ): Promise<void> {
    try {
      const token = this.extractToken(client);

      if (!token) {
        this.logger.warn( `WS connection rejected. socketId=${client.id}. No token` );
        client.disconnect(true);
        return;
      }

      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>( token );
      client.data.userId = Number(payload.id);

      await client.join( this.getUserRoom(payload.id) );

      this.logger.log( `Messenger WS connected userId=${payload.id} socketId=${client.id}` );
    } catch (error) {
      this.logger.warn(
        `Messenger WS auth failed socketId=${client.id}: ${
          error instanceof Error
            ? error.message
            : 'Unknown error'
        }`,
      );

      client.disconnect(true);
    }
  }

  handleDisconnect(  client: Socket ): void {
    const userId = client.data.userId as number | undefined;
    this.logger.log( `Messenger WS disconnected userId=${ userId ?? 'unknown' } socketId=${client.id}` );
  }

  /**
   * Client -> Server   *
   * Клиент отправляет:
   *
   * {
   *   receiverId: number,
   *   message: string
   * }
   *
   * Server:
   * 1. сохраняет сообщение
   * 2. отправляет сохранённое сообщение отправителю
   * 3. отправляет сообщение получателю
   */
  @SubscribeMessage( MessengerWsEvent.RECEIVE_MESSAGE )
  async receiveMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MessageSendDto,
  ): Promise<void> {
    const ownerId = client.data.userId as number;

    try {
      const message = await this.commandBus.execute< SendMessageCommand, MessageViewDto >(
        new SendMessageCommand( ownerId, data.receiverId, data.message ),
      );

      /**
       * Отправителю. Здесь message уже сохранён в БД  и содержит настоящий id.
       */
      client.emit( MessengerWsEvent.RECEIVE_MESSAGE, message );

      /**
       * Получателю. Он должен получить сообщение и вызвать ACK callback.
       */
      this.server
        .to(this.getUserRoom(data.receiverId))
        .emit(
          MessengerWsEvent.MESSAGE_SEND,
          message,
        );
    } catch (error) {
      this.emitError(client, error);
    }
  }

  /**
   * Получатель подтверждает доставку сообщения.
   *   * Client:
   *
   * socket.emit(
   *   'message-send',
   *   { id: message.id },
   *   () => {
   *     // ACK
   *   }
   * )
   *
   * После ACK: SENT -> RECEIVED и отправителю приходит RECEIVE_MESSAGE с новым статусом.
   */
  @SubscribeMessage( MessengerWsEvent.MESSAGE_SEND )
  async messageSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MessageReceivedDto,
    @Ack() ack: () => void,
  ): Promise<void> {
    const receiverId = client.data.userId as number;

    try {
      const updatedMessage = await this.commandBus.execute< MarkMessageReceivedCommand, MessageViewDto | null >(
        new MarkMessageReceivedCommand( data.id, receiverId ),
      );

      /**
       * ACK вызываем только после того, как сервер успешно обработал подтверждение доставки.
       */
      ack();

      if (!updatedMessage) {
        return;
      }

      /**
       * Сообщаем отправителю, что сообщение теперь RECEIVED.
       */
      this.server
        .to(
          this.getUserRoom( updatedMessage.ownerId ),
        )
        .emit( MessengerWsEvent.RECEIVE_MESSAGE, updatedMessage );
    } catch (error) {
      this.emitError(client, error);
    }
  }

  private getUserRoom( userId: number ): string {
    return `user:${userId}`;
  }

  private emitError( client: Socket, error: unknown ): void {
    this.logger.error(
      `Messenger WS error socketId=${client.id}`,
      error instanceof Error
        ? error.stack
        : undefined,
    );

    client.emit( MessengerWsEvent.ERROR,
      {
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error',

        error: MessengerWsEvent.ERROR,
      },
    );
  }

  private extractToken( client: Socket ): string | undefined {
    const authToken = client.handshake.auth?.token;

    if ( typeof authToken === 'string' && authToken.length > 0 ) {
      return authToken;
    }

    const authorization = client.handshake.headers.authorization;

    if ( typeof authorization === 'string' && authorization.startsWith('Bearer ') ) {
      return authorization.replace( 'Bearer ', '' );
    }

    return undefined;
  }
}
