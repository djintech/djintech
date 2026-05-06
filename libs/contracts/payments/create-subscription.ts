import { PaymentType } from "apps/payments/src/generated/prisma/client";
import { IsEnum, IsNotEmpty, IsNumber } from "class-validator";

export class CreateSubscriptionRequest {
  @IsNumber()
  @IsNotEmpty()
  planId!: number;

  @IsNumber()
  @IsNotEmpty()
  customerId!: number;

  @IsEnum(PaymentType)
  paymentType!: PaymentType;
}

export class CreateSubscriptionResponse {
  url!: string
}
