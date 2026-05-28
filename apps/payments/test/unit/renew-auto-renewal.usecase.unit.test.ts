import { RenewAutoRenewalUseCase } from '../../src/modules/subscriptions/application/usecases/renew-auto-renewal.usecase';

describe('RenewAutoRenewalUseCase', () => {
  let useCase: RenewAutoRenewalUseCase;

  let subscriptionsRepository: any;
  let paymentFactory: any;
  let paymentProvider: any;

  beforeEach(() => {
    paymentProvider = {
      renewAutoRenewal: jest.fn(),
    };

    paymentFactory = {
      get: jest.fn().mockReturnValue(paymentProvider),
    };

    subscriptionsRepository = {
      findActiveOrPendingByUserId: jest.fn(),
      update: jest.fn(),
    };

    useCase = new RenewAutoRenewalUseCase(
      subscriptionsRepository,
      paymentFactory,
    );
  });

  it('should enable auto renewal', async () => {
    subscriptionsRepository.findActiveOrPendingByUserId.mockResolvedValue({
      id: 1,
      userId: 10,
      autoRenewal: false,
      providerSubscriptionId: 'sub_123',
      paymentType: 'STRIPE',
    });

    const result = await useCase.execute({
      userId: 10,
    });

    expect(paymentProvider.renewAutoRenewal).toHaveBeenCalledWith(
      'sub_123',
    );

    expect(subscriptionsRepository.update).toHaveBeenCalledWith(
      1,
      {
        autoRenewal: true,
      },
    );

    expect(result).toEqual({
      success: true,
    });
  });

  it('should return success if auto renewal already enabled', async () => {
    subscriptionsRepository.findActiveOrPendingByUserId.mockResolvedValue({
      id: 1,
      autoRenewal: true,
      providerSubscriptionId: 'sub_123',
      paymentType: 'STRIPE',
    });

    const result = await useCase.execute({
      userId: 10,
    });

    expect(
      paymentProvider.renewAutoRenewal,
    ).not.toHaveBeenCalled();

    expect(subscriptionsRepository.update).not.toHaveBeenCalled();

    expect(result).toEqual({
      success: true,
    });
  });
});
