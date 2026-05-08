import { Injectable } from "@nestjs/common";
import { PaymentProvider } from "../domain/payment-provider.interface";

@Injectable()
export class PayPalAdapter implements PaymentProvider {
  async createSession(params: {
    customerId: string;
    priceId: string;
  }) {
    // TODO: интеграция с PayPal

    const fakeOrder = {
      id: "paypal_order_123",
      approveUrl: "https://paypal.com/checkout",
    };

    return {
      id: fakeOrder.id,
      url: fakeOrder.approveUrl,
    };
  }
  async createCustomer(email: string): Promise<{ id: string; }> {
    return { id: 'fake_id'}
  };
}