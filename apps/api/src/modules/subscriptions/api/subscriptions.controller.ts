import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PlansViewDto } from './view-dto/plans.view-dto';
import { GetPlansQuery } from '../application/queries/get-plans.query';
import { ApiGetPlansDocs } from '../swagger/get-plans.swagger';
import { JwtAuthGuard } from '@src/modules/user-accounts/auth/guards/bearer/jwt-auth.guard';

@SkipThrottle()
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  
  @Get('plans')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiGetPlansDocs()
  async getPlans(): Promise<PlansViewDto> {
    return this.queryBus.execute(new GetPlansQuery());
  }
}
