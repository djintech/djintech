import { PaymentType } from "apps/payments/src/generated/prisma/client";

export class SubscriptionDto {
  planId!: number;
  userId!: number;
  email!: string;
  paymentType!: PaymentType;
}