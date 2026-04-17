import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { SubscriptionsController } from './api/subscriptions.controller';

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
    SubscriptionsController,
  ],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class SubscriptionsModule {}