import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PlansViewDto } from "../../api/view-dto/plans.view-dto";
import { PaymentsClientService } from "@src/modules/payments/infrastructure/payments.client";

export class GetPlansQuery {
  constructor() {}
}

@QueryHandler(GetPlansQuery)
export class GetPlansHandler
  implements IQueryHandler<GetPlansQuery, PlansViewDto>
{
  constructor(
    private readonly paymentsClientService: PaymentsClientService,
  ) {}

  async execute() {
     try {
      const plans = await this.paymentsClientService.getPlans();
      return PlansViewDto.mapToView(plans);

    } catch (error) {
      console.error('Payments service error:', error);
      throw new Error('Failed to fetch subscription plans');
    }
  }
}