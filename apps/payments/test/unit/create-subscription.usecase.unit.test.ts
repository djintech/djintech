import { CreateSubscriptionUseCase } from '../../src/modules/subscriptions/application/usecases/create-subscription.usecase';
import { SubscriptionStatus } from '../../src/generated/prisma/enums';

describe('CreateSubscriptionUseCase', () => {
  let useCase: CreateSubscriptionUseCase;
  let paymentFactory: any;
  let paymentProvider: any;
  let planQueryRepository: any;
  let subscriptionsRepository: any;

  beforeEach(() => {
    paymentProvider = {
      createSession: jest.fn().mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      }),
    };

    paymentFactory = {
      get: jest.fn().mockReturnValue(paymentProvider),
    };

    planQueryRepository = {
      getById: jest.fn().mockResolvedValue({
        id: 1,
        subscriptionType: 'MONTHLY',
      }),
    };

    subscriptionsRepository = {
      findActiveOrPendingByUserId: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
    };

    useCase = new CreateSubscriptionUseCase(
      paymentFactory,
      planQueryRepository,
      subscriptionsRepository,
    );
  });

  it('should create subscription with PENDING status', async () => {
    await useCase.execute({
      dto: {
        customerId: 10,
        planId: 1,
        paymentType: 'STRIPE',
      },
    });

    expect(subscriptionsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 10,
        status: SubscriptionStatus.PENDING,
        autoRenewal: true,
        externalId: 'cs_test_123',
        paymentType: 'STRIPE',
      }),
    );
  });

  it('should return checkout session URL', async () => {
    const result = await useCase.execute({
      dto: {
        customerId: 10,
        planId: 1,
        paymentType: 'STRIPE',
      },
    });

    expect(result).toEqual({ url: 'https://checkout.stripe.com/test' });
  });

  it('should update existing PENDING subscription with new externalId', async () => {
    subscriptionsRepository.findActiveOrPendingByUserId.mockResolvedValue({
      id: 7,
      planId: 1,
      status: SubscriptionStatus.PENDING,
    });

    await useCase.execute({
      dto: {
        customerId: 10,
        planId: 1,
        paymentType: 'STRIPE',
      },
    });

    expect(subscriptionsRepository.update).toHaveBeenCalledWith(7, {
      externalId: 'cs_test_123',
    });
    expect(subscriptionsRepository.create).not.toHaveBeenCalled();
  });

  it('should disable autoRenewal when existing subscription is ACTIVE', async () => {
    subscriptionsRepository.findActiveOrPendingByUserId.mockResolvedValue({
      id: 7,
      planId: 1,
      status: SubscriptionStatus.ACTIVE,
    });

    await useCase.execute({
      dto: {
        customerId: 10,
        planId: 1,
        paymentType: 'STRIPE',
      },
    });

    expect(subscriptionsRepository.update).toHaveBeenCalledWith(7, {
      autoRenewal: false,
    });
    expect(subscriptionsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: SubscriptionStatus.PENDING,
        externalId: 'cs_test_123',
      }),
    );
  });
});
