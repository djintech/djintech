import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StripeAdapter } from '../stripe.adapter';
import { SubscriptionsRepository } from '../../infrastructure/subscriptions.repository';
import { StripeEventType } from '../../constants/stripe.constants';
import { SubscriptionStatus } from 'apps/payments/src/generated/prisma/enums';
import { SubscriptionEventsPublisher } from '../../infrastructure/rabbitmq/subscription-events.publisher';

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
    private readonly subscriptionEventsPublisher: SubscriptionEventsPublisher,
  ) {}

  async execute({ signature, rawBody }: StripeWebhookCommand) {
    try {
      if (!signature) {
        throw new Error('Missing Stripe signature');
      }

      let event;

      try {
        event = this.stripeAdapter.constructWebhookEvent(rawBody, signature);
      } catch (e) {
        throw new Error('Invalid Stripe signature');
      }

      switch (event.type) {
        case StripeEventType.CHECKOUT_SESSION_COMPLETED: {
          const session = event.data.object;          
          const externalId = session.id;
          const subscriptionId = session.subscription as string | undefined;

          let subscription = await this.subscriptionsRepository.findByExternalId(externalId);

          if (!subscription && session.customer) {
            subscription =
              await this.subscriptionsRepository.findByCustomerId(
                session.customer as string,
              );
          }

          if (!subscription) return;

          const currentActive =
            await this.subscriptionsRepository.findCurrentActiveByUserId(
              subscription.userId,
            );

          const updateData: any = {};
//            status: SubscriptionStatus.ACTIVE,};

          if (subscriptionId) {
            updateData.providerSubscriptionId = subscriptionId;
            const stripeSubscription = await this.stripeAdapter.getSubscription(subscriptionId);
          
            const item = stripeSubscription.items?.data?.[0];
            if (item) {
              const stripeStartAt = new Date(item.current_period_start * 1000);
              const stripeExpireAt = new Date(item.current_period_end * 1000);

              //updateData.startAt = new Date(item.current_period_start * 1000);
              //updateData.expireAt = new Date(item.current_period_end * 1000);
             if (
                currentActive &&
                currentActive.id !== subscription.id
                && currentActive.expireAt
              ) {
                updateData.status = SubscriptionStatus.PENDING;

                updateData.startAt = currentActive.expireAt;

                const durationMs =
                  stripeExpireAt.getTime() - stripeStartAt.getTime();

                updateData.expireAt = new Date(
                  currentActive.expireAt.getTime() + durationMs,
                );
              } else {
                updateData.status = SubscriptionStatus.ACTIVE;

                updateData.startAt = stripeStartAt;
                updateData.expireAt = stripeExpireAt;
              }
            }
          }

          await this.subscriptionsRepository.update(subscription.id, updateData);

          if (updateData.status === SubscriptionStatus.ACTIVE) {
            this.subscriptionEventsPublisher.publishSubscriptionActivated({
              userId: subscription.userId,
              subscriptionId: subscription.id,
              expireAt: updateData.expireAt?.toISOString() ?? null,
            });
          }

          break;
        }

        case StripeEventType.INVOICE_PAID: {
          const invoice = event.data.object;

          const subscriptionId = this.getInvoiceSubscriptionId(invoice);
          if (!subscriptionId) return;

          const subscription = await this.findByProviderSubscriptionId(subscriptionId);
          if (!subscription) return;

          await this.subscriptionsRepository.update(subscription.id, {
            status: SubscriptionStatus.ACTIVE,
          });

          this.subscriptionEventsPublisher.publishSubscriptionActivated({
            userId: subscription.userId,
            subscriptionId: subscription.id,
            expireAt: subscription.expireAt?.toISOString() ?? null,
          });

          break;
        }

        case StripeEventType.CUSTOMER_SUBSCRIPTION_DELETED: {
          const stripeSubscription = event.data.object;
          const subscription = await this.findByProviderSubscriptionId(stripeSubscription.id);
          if (!subscription) return;

          await this.subscriptionsRepository.update(subscription.id, {
            status: SubscriptionStatus.CANCELED,
            autoRenewal: false,
          });

          const nextSubscription = await this.subscriptionsRepository.findFirstPendingByUserId(subscription.userId);

          if (nextSubscription) {
            await this.subscriptionsRepository.update(
              nextSubscription.id,
              {
                status: SubscriptionStatus.ACTIVE,
              },
            );

            this.subscriptionEventsPublisher.publishSubscriptionActivated({
              userId: nextSubscription.userId,
              subscriptionId: nextSubscription.id,
              expireAt:
                nextSubscription.expireAt?.toISOString() ?? null,
            });
          }

          this.subscriptionEventsPublisher.publishSubscriptionExpired({
            userId: subscription.userId,
            subscriptionId: subscription.id,
          });
 
          break;
        }
      }

      return { received: true };
    } catch (err) {
      console.error(err);
      throw new Error('Invalid Stripe signature');
    }
  }

  private async findByProviderSubscriptionId(subscriptionId: string) {
    return this.subscriptionsRepository.findByProviderSubscriptionId(subscriptionId);
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
