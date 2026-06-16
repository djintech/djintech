import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { NotificationsGateway } from './infrastructure/notifications.gateway';

const commandHandlers = [
];

const queryHandlers = [
];

@Module({
  imports: [
    CqrsModule,
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
