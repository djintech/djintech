import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StripeAdapter } from '../stripe.adapter';
import { SubscriptionsRepository } from '../../infrastructure/subscriptions.repository';
import { StripeEventType } from '../../constants/stripe.constants';
import { SubscriptionStatus } from 'apps/payments/src/generated/prisma/enums';

export class StripeWebhookCommand {
  constructor(
    public signature: string,
    public rawBody: Buffer,
  ) {}
}

@CommandHandler(StripeWebhookCommand)
export class StripeWebhookUseCase implements ICommandHandler<StripeWebhookCommand> {
  //private readonly logger = new Logger(StripeWebhookUseCase.name);

  constructor(
    private readonly stripeAdapter: StripeAdapter,
    private readonly subscriptionsRepository: SubscriptionsRepository,
  ) {}

  async execute({ signature, rawBody }: StripeWebhookCommand) {
    try {
      if (!signature) {
        throw new Error('Missing Stripe signature');
      }

      const event = this.stripeAdapter.constructWebhookEvent(rawBody, signature);

      switch (event.type) {
        case StripeEventType.CHECKOUT_SESSION_COMPLETED: {
          const session = event.data.object;
          const subscriptionId = session.subscription as string;
          if (!subscriptionId) return;

          const subscription = await this.subscriptionsRepository.findByExternalId(session.id);
          if (!subscription) return;

          const stripeSubscription = await this.stripeAdapter.getSubscription(subscriptionId);
          
          const item = stripeSubscription.items?.data?.[0];
          if (!item) return;

          await this.subscriptionsRepository.update(subscription.id, {
            status: SubscriptionStatus.ACTIVE,
            startAt: new Date(item.current_period_start * 1000),
            expireAt: new Date(item.current_period_end * 1000),
          });

          break;
        }

        case StripeEventType.INVOICE_PAID: {
          const invoice = event.data.object;
          const subscriptionId = this.getInvoiceSubscriptionId(invoice);
          if (!subscriptionId) return;

          const subscription = await this.findByStripeSubscriptionId(subscriptionId);
          if (!subscription) return;

          await this.subscriptionsRepository.update(subscription.id, {
            status: SubscriptionStatus.ACTIVE,
          });

          break;
        }

        case StripeEventType.CUSTOMER_SUBSCRIPTION_DELETED: {
          const stripeSubscription = event.data.object;
          const subscription = await this.findByStripeSubscriptionId(stripeSubscription.id);
          if (!subscription) return;

          await this.subscriptionsRepository.update(subscription.id, {
            status: SubscriptionStatus.CANCELED,
            autoRenewal: false,
          });

          break;
        }
      }

      return { received: true };
    } catch (err) {
      throw new Error('Invalid Stripe signature');
    }
  }

  private async findByStripeSubscriptionId(subscriptionId: string) {
    const session = await this.stripeAdapter.findCheckoutSessionBySubscriptionId(subscriptionId);
    if (!session) return null;

    return this.subscriptionsRepository.findByExternalId(session.id);
  }

  private getInvoiceSubscriptionId(invoice: any): string | null {
    const subscription = (invoice as any).subscription;

    if (typeof subscription === 'string') return subscription;
    if (subscription?.id) return subscription.id;

    const parentSubscription = (invoice as any).parent?.subscription_details?.subscription;
    if (typeof parentSubscription === 'string') return parentSubscription;
    if (parentSubscription?.id) return parentSubscription.id;

    return null;
  }
}
