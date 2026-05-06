import { PaymentType } from "apps/payments/src/generated/prisma/enums";

export class CreateSubscriptionDto {
  planId!: number;
  paymentType!: PaymentType;
}

