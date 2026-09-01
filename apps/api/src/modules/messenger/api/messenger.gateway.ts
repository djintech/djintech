import { Inject, Logger, } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '@src/modules/user-accounts/auth/constants/auth-tokens.inject-constants';
import { MessengerWsEvent } from './constants/messenger-ws-events';
import { MessageSendDto } from './input-dto/message-send.input-dto';

type AccessTokenPayload = {
  userId: number;
};

@WebSocketGateway({
  namespace: '/messenger',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class MessengerGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(MessengerGateway.name);

  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = this.extractToken(client);

      if (!token) {
        this.logger.warn( `WS connection rejected. socketId=${client.id}. No token` );

        client.disconnect(true);
        return;
      }

      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token);

      client.data.userId = payload.userId;

      await client.join(this.getUserRoom(payload.userId));

      this.logger.log( `Messenger WS connected userId=${payload.userId} socketId=${client.id}` );
    } catch (error) {
      this.logger.warn(
        `Messenger WS auth failed socketId=${client.id}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );

      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    const userId = client.data.userId as number | undefined;
    this.logger.log( `Messenger WS disconnected userId=${userId ?? 'unknown'} socketId=${client.id}` );
  }

  @SubscribeMessage(MessengerWsEvent.RECEIVE_MESSAGE)
  async receiveMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MessageSendDto,
  ) {
    const userId = client.data.userId as number;

    this.logger.log(
      `Message from ${userId} to ${data.receiverId}`,
    );
  }

  private getUserRoom(userId: number): string {
    return `user:${userId}`;
  }

  private extractToken(client: Socket): string | undefined {
    const authToken = client.handshake.auth?.token;

    if (
      typeof authToken === 'string' &&
      authToken.length > 0
    ) {
      return authToken;
    }

    const authorization =
      client.handshake.headers.authorization;

    if (
      typeof authorization === 'string' &&
      authorization.startsWith('Bearer ')
    ) {
      return authorization.replace('Bearer ', '');
    }

    return undefined;
  }
}
