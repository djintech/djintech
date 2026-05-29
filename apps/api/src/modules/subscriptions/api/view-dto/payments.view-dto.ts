import { PaymentType, SubscriptionType } from '@libs/contracts/payments/subscription';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentsViewModel {
  @ApiProperty()
  userId!: number;

  @ApiProperty()
  subscriptionId!: number;

  @ApiProperty({ type: String, nullable: true })
  startAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  expireAt!: string | null;

  @ApiProperty()
  price!: number;

  @ApiProperty({ enum: SubscriptionType })
  subscriptionType!: SubscriptionType;

  @ApiProperty({ enum: PaymentType })
  paymentType!: PaymentType;
}

export class PaymentsWithPaginationViewModel {
  @ApiProperty()
  totalCount!: number;

  @ApiProperty()
  pagesCount!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty({ type: () => [PaymentsViewModel] })
  items!: PaymentsViewModel[];
}
