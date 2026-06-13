import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PlansViewDto } from './view-dto/plans.view-dto';
import { GetPlansQuery } from '../application/queries/get-plans.query';
import { ApiGetPlansDocs } from '../swagger/get-plans.swagger';
import { JwtAuthGuard } from '@src/modules/user-accounts/auth/guards/bearer/jwt-auth.guard';
import { SubscriptionInputDto } from './input-dto/subscriptipns.input-dto';
import { UserId } from '@src/modules/user-accounts/auth/guards/decorators/param/user-id.decorator';
import { SubscriptionsViewDto } from './view-dto/subscriptipns.view-dto';
import { ApiCreateSubscriptionDocs } from '../swagger/create-subscription.swagger';
import { CreateSubscriptionCommand } from '../application/usecases/create-subscription.usecase';
import { CancelAutoRenewalCommand } from '../application/usecases/cancel-auto-renewal.usecase';
import { ApiCancelAutoRenewalDocs } from '../swagger/cancel-auto-renewal.swagger';
import { ApiRenewAutoRenewalDocs } from '../swagger/renew-auto-renewal.swagger';
import { RenewAutoRenewalCommand } from '../application/usecases/renew-auto-renewal.usecase';
import { ApiGetMyPaymentsDocs } from '../swagger/get-my-payments.swagger';
import { GetMyPaymentsQueryParams } from './input-dto/get-my-payments.input-dto';
import { GetMyPaymentsQuery } from '../application/queries/get-my-payments.query';
import { PaymentsWithPaginationViewModel } from './view-dto/payments.view-dto';
import { ApiGetCurrentPaymentSubscriptionDocs } from '../swagger/get-current-payment-subscription.swagger';
import { GetCurrentPaymentSubscriptionQuery } from '../application/queries/get-current-payment-subscription.query';
import { CurrentPaymentSubscriptionViewDto } from './view-dto/current-payment-subscription.view-dto';

@SkipThrottle()
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateSubscriptionDocs()
  async createSubscription(
    @UserId() userId: number,
    @Body() dto: SubscriptionInputDto,
  ): Promise<SubscriptionsViewDto> {
    return this.commandBus.execute( new CreateSubscriptionCommand(userId, dto) );
  }

  @Post('canceled-auto-renewal')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCancelAutoRenewalDocs()
  async cancelAutoRenewal( @UserId() userId: number ): Promise<void> {
    return this.commandBus.execute( new CancelAutoRenewalCommand(userId) );
  }

  @Post('renew-auto-renewal')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiRenewAutoRenewalDocs()
  async renewAutoRenewal( @UserId() userId: number ): Promise<void> {
    return this.commandBus.execute( new RenewAutoRenewalCommand(userId) );
  }

  @Get('my-payments')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiGetMyPaymentsDocs()
  async getMyPayments(
    @UserId() userId: number,
    @Query() query: GetMyPaymentsQueryParams,
  ): Promise<PaymentsWithPaginationViewModel> {
    return this.queryBus.execute(new GetMyPaymentsQuery(userId, query));
  }

  @Get('current-payment-subscriptions')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiGetCurrentPaymentSubscriptionDocs()
  async getCurrentPaymentSubscription(
    @UserId() userId: number,
  ): Promise<CurrentPaymentSubscriptionViewDto | null> {
    return this.queryBus.execute(new GetCurrentPaymentSubscriptionQuery(userId));
  }

  @Get('plans')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiGetPlansDocs()
  async getPlans(): Promise<PlansViewDto> {
    return this.queryBus.execute(new GetPlansQuery());
  }
}
