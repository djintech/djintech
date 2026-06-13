import { Injectable, Logger } from '@nestjs/common';
import { CoreConfig } from 'apps/payments/src/core/config/core.config';
import Stripe from 'stripe';
import { PaymentProvider } from '../domain/payment-provider.interface';
import { buildPaymentUrl, PAYMENT_STATUS } from '../constants/payment-redirect';

@Injectable()
export class StripeAdapter  implements PaymentProvider {
  private stripe;
  private readonly logger = new Logger(StripeAdapter.name);

  constructor(private readonly coreConfig: CoreConfig) {
    this.stripe = new Stripe(this.coreConfig.stripeSecretKey);
  }

  async createSession(params: {
    customerId: string;
    priceId: string;
  }) {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: params.customerId,
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      success_url: buildPaymentUrl( this.coreConfig.frontendUrl, PAYMENT_STATUS.SUCCESS),
      cancel_url: buildPaymentUrl( this.coreConfig.frontendUrl, PAYMENT_STATUS.CANCEL),
    });

    return {
      id: session.id,
      url: session.url!,
    };
  }

  async createCustomer(email: string) {
    return this.stripe.customers.create({ email });
  }

  async getSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async findCheckoutSessionBySubscriptionId(subscriptionId: string) {
    const sessions = await this.stripe.checkout.sessions.list({
      subscription: subscriptionId,
      limit: 1,
    } as any);

    return sessions.data[0] ?? null;
  }

  async cancelAutoRenewal(subscriptionId: string) {
    try {
      return await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })
    } catch (e) {
      this.logger.error('cancelAutoRenewal failed', e);
      throw e;
    }
  }

  async renewAutoRenewal(subscriptionId: string) {
    return this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }

  async getInvoices(customerId: string) {
    return this.stripe.invoices.list({
      customer: customerId,
    });
  }

  constructWebhookEvent(payload: Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.coreConfig.stripeWebhookSecret,
    );
  }
}
