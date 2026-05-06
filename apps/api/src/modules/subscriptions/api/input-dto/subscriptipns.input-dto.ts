import { PaymentType } from "@libs/contracts/payments/subscription";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber } from "class-validator";

export class SubscriptionInputDto {
  @IsNumber()
  planId!: number;

  @ApiProperty({
      enum: PaymentType,
      example: PaymentType.STRIPE,
      description: 'Payment type',
    })
  @IsEnum(PaymentType)
  paymentType!: PaymentType;
}
