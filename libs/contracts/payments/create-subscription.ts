import { PaymentType } from "apps/payments/src/generated/prisma/client";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateSubscriptionRequest {
  @IsNumber()
  @IsNotEmpty()
  planId!: number;

  @IsNumber()
  @IsNotEmpty()
  userId!: number;

  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsEnum(PaymentType)
  paymentType!: PaymentType;
}

export class CreateSubscriptionResponse {
  url!: string
}
