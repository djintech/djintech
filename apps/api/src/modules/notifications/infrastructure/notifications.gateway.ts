import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '@src/modules/user-accounts/auth/constants/auth-tokens.inject-constants';

type AccessTokenPayload = {
  userId: number;
};

@Injectable()
@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = this.extractToken(client);

      if (!token) {
        this.logger.warn(
          `WS connection rejected. socketId=${client.id}. No token`,
        );

        client.disconnect(true);

        return;
      }

      const payload =
        await this.jwtService.verifyAsync<AccessTokenPayload>(token);

      const room = this.getUserRoom(payload.userId);

      client.data.userId = payload.userId;

      await client.join(room);

      this.logger.log(
        `WS connected userId=${payload.userId} socketId=${client.id}`,
      );
    } catch (error) {
      this.logger.warn(
        `WS auth failed socketId=${client.id}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );

      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    const userId = client.data.userId as number | undefined;

    this.logger.log(
      `WS disconnected userId=${userId ?? 'unknown'} socketId=${client.id}`,
    );
  }

  sendToUser(
    userId: number,
    event: string,
    payload: unknown,
  ): void {
    this.server
      .to(this.getUserRoom(userId))
      .emit(event, payload);
  }

  sendNotification(
    userId: number,
    payload: unknown,
  ): void {
    this.sendToUser(
      userId,
      'notification',
      payload,
    );
  }

  private getUserRoom(userId: number): string {
    return `user:${userId}`;
  }

  private extractToken(
    client: Socket,
  ): string | undefined {
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
