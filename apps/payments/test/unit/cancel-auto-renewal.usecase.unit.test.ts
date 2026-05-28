import { CancelAutoRenewalUseCase } from '../../src/modules/subscriptions/application/usecases/cancel-auto-renewal.usecase';

describe('CancelAutoRenewalUseCase', () => {
  let useCase: CancelAutoRenewalUseCase;
  let subscriptionsRepository: any;
  let paymentFactory: any;
  let paymentProvider: any;

  beforeEach(() => {
    paymentProvider = {
      cancelAutoRenewal: jest.fn(),
    };

    paymentFactory = {
      get: jest.fn().mockReturnValue(paymentProvider),
    };

    subscriptionsRepository = {
      findActiveOrPendingByUserId: jest.fn(),
      update: jest.fn(),
    };

    useCase = new CancelAutoRenewalUseCase(
      subscriptionsRepository,
      paymentFactory,
    );
  });

  it('should disable auto renewal', async () => {
    subscriptionsRepository.findActiveOrPendingByUserId.mockResolvedValue({
      id: 1,
      userId: 10,
      autoRenewal: true,
      providerSubscriptionId: 'sub_123',
      paymentType: 'STRIPE',
    });

    const result = await useCase.execute({
      userId: 10,
    });

    expect(paymentProvider.cancelAutoRenewal).toHaveBeenCalledWith(
      'sub_123',
    );

    expect(subscriptionsRepository.update).toHaveBeenCalledWith(
      1,
      {
        autoRenewal: false,
      },
    );

    expect(result).toEqual({
      success: true,
    });
  });

  it('should return success if auto renewal already disabled', async () => {
    subscriptionsRepository.findActiveOrPendingByUserId.mockResolvedValue({
      id: 1,
      autoRenewal: false,
      providerSubscriptionId: 'sub_123',
      paymentType: 'STRIPE',
    });

    const result = await useCase.execute({
      userId: 10,
    });

    expect(
      paymentProvider.cancelAutoRenewal,
    ).not.toHaveBeenCalled();

    expect(subscriptionsRepository.update).not.toHaveBeenCalled();

    expect(result).toEqual({
      success: true,
    });
  });
});
