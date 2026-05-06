import { Test } from '@nestjs/testing';
import { CreateSubscriptionUseCase } from '../../src/modules/subscriptions/application/usecases/create-subscription.usecase';
import { StripeWebhookUseCase } from '../../src/modules/subscriptions/application/usecases/stripe-webhook.use-case';
import { PlanQueryRepository } from '../../src/modules/subscriptions/infrastructure/query/plan.query.repository';
import { SubscriptionsRepository } from '../../src/modules/subscriptions/infrastructure/subscriptions.repository';
import { PaymentFactory } from '../../src/modules/subscriptions/infrastructure/payment.factory';
import { StripeAdapter } from '../../src/modules/subscriptions/application/stripe.adapter';
import { PayPalAdapter } from '../../src/modules/subscriptions/application/paypal.adapter';
import { StripeEventType } from '../../src/modules/subscriptions/constants/stripe.constants';
import { SubscriptionStatus } from '../../src/generated/prisma/enums';

describe('CreateSubscriptionUseCase + StripeWebhookUseCase integration', () => {
  let createSubscriptionUseCase: CreateSubscriptionUseCase;
  let stripeWebhookUseCase: StripeWebhookUseCase;
  let subscriptionsRepository: any;
  let stripeAdapter: any;
  let db: any[];

  beforeEach(async () => {
    db = [];

    subscriptionsRepository = {
      create: jest.fn(async (data) => {
        const subscription = {
          id: db.length + 1,
          userId: data.userId,
          planId: data.plan.connect.id,
          status: data.status,
          autoRenewal: data.autoRenewal,
          externalId: data.externalId,
          paymentType: data.paymentType,
          startAt: null,
          expireAt: null,
        };

        db.push(subscription);
        return subscription;
      }),
      update: jest.fn(async (id, data) => {
        const subscription = db.find((item) => item.id === id);

        Object.assign(subscription, {
          ...data,
          planId: data.plan?.connect?.id ?? subscription.planId,
        });

        delete subscription.plan;
        return subscription;
      }),
      findByExternalId: jest.fn(async (externalId) => {
        return db.find((item) => item.externalId === externalId) ?? null;
      }),
      findActiveOrPendingByUserId: jest.fn(async (userId) => {
        return db.find((item) => (
          item.userId === userId
          && [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING].includes(item.status)
        )) ?? null;
      }),
    };

    stripeAdapter = {
      createSession: jest.fn().mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      }),
      constructWebhookEvent: jest.fn().mockReturnValue({
        type: StripeEventType.CHECKOUT_SESSION_COMPLETED,
        data: {
          object: {
            id: 'cs_test_123',
            subscription: 'sub_test_123',
          },
        },
      }),
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
      findCheckoutSessionBySubscriptionId: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CreateSubscriptionUseCase,
        StripeWebhookUseCase,
        PaymentFactory,
        {
          provide: PlanQueryRepository,
          useValue: {
            getById: jest.fn().mockResolvedValue({
              id: 1,
              subscriptionType: 'MONTHLY',
            }),
          },
        },
        {
          provide: SubscriptionsRepository,
          useValue: subscriptionsRepository,
        },
        {
          provide: StripeAdapter,
          useValue: stripeAdapter,
        },
        {
          provide: PayPalAdapter,
          useValue: {
            createSession: jest.fn(),
          },
        },
      ],
    }).compile();

    createSubscriptionUseCase = moduleRef.get(CreateSubscriptionUseCase);
    stripeWebhookUseCase = moduleRef.get(StripeWebhookUseCase);
  });

  it('should create checkout session and activate subscription from webhook', async () => {
    const result = await createSubscriptionUseCase.execute({
      dto: {
        customerId: 10,
        planId: 1,
        paymentType: 'STRIPE',
      },
    });

    expect(result).toEqual({ url: 'https://checkout.stripe.com/test' });
    expect(db).toHaveLength(1);
    expect(db[0]).toEqual(
      expect.objectContaining({
        status: SubscriptionStatus.PENDING,
        externalId: 'cs_test_123',
      }),
    );

    await stripeWebhookUseCase.execute({
      signature: 'valid_signature',
      rawBody: Buffer.from('{}'),
    });

    expect(db[0].status).toBe(SubscriptionStatus.ACTIVE);
    expect(db[0].startAt).toEqual(new Date(1000 * 1000));
    expect(db[0].expireAt).toEqual(new Date(2000 * 1000));
  });
});
