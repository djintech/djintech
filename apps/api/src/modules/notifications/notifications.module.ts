import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

const commandHandlers = [
];

const queryHandlers = [
];

@Module({
  imports: [
    CqrsModule,
  ],
  controllers: [
  ],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class NotificationsModule {}
