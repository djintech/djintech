import { Injectable } from "@nestjs/common";
import { StripeAdapter } from "../application/stripe.adapter";
import { PayPalAdapter } from "../application/paypal.adapter";
import { PaymentProvider } from "../domain/payment-provider.interface";
import { PaymentType } from "apps/payments/src/generated/prisma/client";

@Injectable()
export class PaymentFactory {
  constructor(
    private readonly stripe: StripeAdapter,
    private readonly paypal: PayPalAdapter,
  ) {}

  get(type: PaymentType): PaymentProvider {
    switch (type) {
      case "STRIPE":
        return this.stripe;
      case "PAYPAL":
        return this.paypal;
      default:
        throw new Error("Unsupported payment type");
    }
  }
}
