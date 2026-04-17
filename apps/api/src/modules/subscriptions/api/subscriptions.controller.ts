import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PaymentsClientService } from '@src/modules/payments/infrastructure/payments.client';

@SkipThrottle()
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly paymentsClientService: PaymentsClientService,
  ) {}
  
  @Get('test')
  @HttpCode(HttpStatus.OK)
  async testGet() {
    return this.paymentsClientService.create();
  }

}
