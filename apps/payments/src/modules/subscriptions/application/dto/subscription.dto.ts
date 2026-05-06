import { PaymentType } from "apps/payments/src/generated/prisma/client";

export class SubscriptionDto {
  planId!: number;
  customerId!: number;
  paymentType!: PaymentType;
}