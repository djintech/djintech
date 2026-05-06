import { SubscriptionsRepository } from '../../src/modules/subscriptions/infrastructure/subscriptions.repository';

describe('SubscriptionsRepository', () => {
  let repository: SubscriptionsRepository;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      subscription: {
        findFirst: jest.fn(),
      },
    };

    repository = new SubscriptionsRepository(prisma);
  });

  it('findByExternalId should return subscription by externalId', async () => {
    const subscription = {
      id: 1,
      externalId: 'cs_test_123',
    };

    prisma.subscription.findFirst.mockResolvedValue(subscription);

    await expect(repository.findByExternalId('cs_test_123')).resolves.toEqual(subscription);
    expect(prisma.subscription.findFirst).toHaveBeenCalledWith({
      where: { externalId: 'cs_test_123' },
    });
  });
});
