import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '@src/generated/prisma/enums';

export class CurrentPaymentSubscriptionViewDto {
  @ApiProperty()
  subscriptionId!: number;

  @ApiProperty({ enum: AccountType })
  accountType!: AccountType;

  @ApiProperty({ type: String, nullable: true })
  expireAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  nextPaymentDate!: string | null;

  @ApiProperty()
  autoRenewal!: boolean;

  @ApiProperty()
  planId!: number;
}
