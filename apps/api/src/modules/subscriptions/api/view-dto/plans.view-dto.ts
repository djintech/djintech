import { SubscriptionType } from "@libs/contracts/payments/subscription";
import { ApiProperty } from "@nestjs/swagger";

class PlanInfoDto {
  @ApiProperty()
  amount!: number;

  @ApiProperty()
  subscriptionType!: SubscriptionType;

  @ApiProperty()
  currency!: string;
}

export class PlansViewDto {
  @ApiProperty({ type: () => [PlanInfoDto] })
  data!: PlanInfoDto[];

  static mapToView( plan ): PlansViewDto {
    const dto = new PlansViewDto();

    dto.data = plan.map( p  => ({
      amount: p.price,
      subscriptionType: p.subscriptionType,
      currency: p.currency
    }));    
    
    return dto;
  }
}