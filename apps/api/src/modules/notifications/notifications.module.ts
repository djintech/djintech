import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { NotificationsController } from './api/notifications.controller';
import { SubscriptionActivatedConsumer } from '../subscriptions/infrastructure/subscription-activated.consumer';
import { NotificationsGateway } from './infrastructure/notifications.gateway';

const commandHandlers = [
];

const queryHandlers = [
];

@Module({
  imports: [
    CqrsModule,
    JwtModule,
    UserAccountsModule,
  ],
  controllers: [
  ],
  providers: [
    NotificationsGateway,
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class NotificationsModule {}
