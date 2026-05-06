import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
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

  @Get('plans')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiGetPlansDocs()
  async getPlans(): Promise<PlansViewDto> {
    return this.queryBus.execute(new GetPlansQuery());
  }
}
