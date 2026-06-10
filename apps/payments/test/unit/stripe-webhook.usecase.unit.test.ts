import { StripeWebhookUseCase } from '../../src/modules/subscriptions/application/usecases/stripe-webhook.use-case';
import { StripeEventType } from '../../src/modules/subscriptions/constants/stripe.constants';
import { SubscriptionStatus } from '../../src/generated/prisma/enums';

describe('StripeWebhookUseCase', () => {
  let useCase: StripeWebhookUseCase;
  let stripeAdapter: any;
  let subscriptionsRepository: any;
  let subscriptionEventsPublisher: any;

  beforeEach(() => {
    stripeAdapter = {
      constructWebhookEvent: jest.fn(),
      getSubscription: jest.fn().mockResolvedValue({
        items: {
          data: [
            {
              current_period_start: 1000,
              current_period_end: 2000,
            },
          ],
        },
      }),
      findCheckoutSessionBySubscriptionId: jest.fn().mockResolvedValue({
        id: 'cs_test_123',
      }),
    };

    stripeAdapter.constructWebhookEvent.mockReturnValue({
      type: StripeEventType.CHECKOUT_SESSION_COMPLETED,
      data: {
        object: {
          id: 'cs_test_123',
          subscription: 'sub_test_123',
        },
      },
    });

    subscriptionsRepository = {
      findByExternalId: jest.fn().mockResolvedValue({
        id: 1,
        userId: 10,
        externalId: 'cs_test_123',
      }),

      findByProviderSubscriptionId: jest.fn().mockResolvedValue({
        id: 1,
        userId: 10,
        providerSubscriptionId: 'sub_test_123',
      }),
    
      findCurrentActiveByUserId: jest.fn().mockResolvedValue(null),

      findFirstPendingByUserId: jest.fn().mockResolvedValue(null),

      update: jest.fn(),
    };

    subscriptionEventsPublisher = {
      publishSubscriptionActivated: jest.fn(),
      publishSubscriptionExpired: jest.fn(),
      publishSubscriptionRenewed: jest.fn(),
    };

    useCase = new StripeWebhookUseCase(
      stripeAdapter,
      subscriptionsRepository,
      subscriptionEventsPublisher
    );
  });

  it('checkout.session.completed should set subscription ACTIVE and set dates', async () => {
    stripeAdapter.constructWebhookEvent.mockReturnValue({
      type: StripeEventType.CHECKOUT_SESSION_COMPLETED,
      data: {
        object: {
          id: 'cs_test_123',
          subscription: 'sub_test_123',
        },
      },
    });

    await useCase.execute({
      signature: 'valid_signature',
      rawBody: Buffer.from('{}'),
    });

    expect(subscriptionsRepository.findByExternalId).toHaveBeenCalledWith('cs_test_123');
    expect(subscriptionsRepository.update).toHaveBeenCalledWith(1, {
      status: SubscriptionStatus.ACTIVE,
      "providerSubscriptionId": "sub_test_123",
      startAt: new Date(1000 * 1000),
      expireAt: new Date(2000 * 1000),
    });
  });

  it('invoice.paid should set status ACTIVE', async () => {
    stripeAdapter.constructWebhookEvent.mockReturnValue({
      type: StripeEventType.INVOICE_PAID,
      data: {
        object: {
          subscription: 'sub_test_123',
        },
      },
    });

    await useCase.execute({
      signature: 'valid_signature',
      rawBody: Buffer.from('{}'),
    });

    expect(subscriptionsRepository.findByProviderSubscriptionId,).toHaveBeenCalledWith('sub_test_123');
    expect(subscriptionsRepository.update).toHaveBeenCalledWith(1, {
      status: SubscriptionStatus.ACTIVE,
    });
  });

  it('customer.subscription.deleted should set status CANCELED and autoRenewal false', async () => {
    stripeAdapter.constructWebhookEvent.mockReturnValue({
      type: StripeEventType.CUSTOMER_SUBSCRIPTION_DELETED,
      data: {
        object: {
          id: 'sub_test_123',
        },
      },
    });

    await useCase.execute({
      signature: 'valid_signature',
      rawBody: Buffer.from('{}'),
    });

    expect( subscriptionsRepository.findByProviderSubscriptionId).toHaveBeenCalledWith('sub_test_123');
    expect(subscriptionsRepository.update).toHaveBeenCalledWith(1, {
      status: SubscriptionStatus.CANCELED,
      autoRenewal: false,
    });
  });

  it('invalid signature should throw "Invalid Stripe signature"', async () => {
    stripeAdapter.constructWebhookEvent.mockImplementation(() => {
      throw new Error('signature verification failed');
    });

    await expect(
      useCase.execute({
        signature: 'invalid_signature',
        rawBody: Buffer.from('{}'),
      }),
    ).rejects.toThrow('Invalid Stripe signature');
  });
});
