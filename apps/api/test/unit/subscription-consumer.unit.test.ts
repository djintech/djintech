// subscription.consumer.spec.ts
import { Test } from '@nestjs/testing';
import { NotificationType } from '@src/generated/prisma/enums';
import { SubscriptionConsumer } from '@src/modules/notifications/application/consumers/subscription-activated.consumer';
import { NotificationsService } from '@src/modules/notifications/application/services/notifications.service';
import { NotificationsRepository } from '@src/modules/notifications/infrastructure/notifications.repository';

const mockNotificationsService = { createAndSend: jest.fn() };
const mockNotificationsRepository = { existsByTypeAndPeriod: jest.fn() };

describe('SubscriptionConsumer', () => {
  let consumer: SubscriptionConsumer;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [SubscriptionConsumer],
      providers: [
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: NotificationsRepository, useValue: mockNotificationsRepository },
      ],
    }).compile();

    consumer = module.get(SubscriptionConsumer);
  });

  it('отправляет уведомление если дубля нет', async () => {
    mockNotificationsRepository.existsByTypeAndPeriod.mockResolvedValue(false);

    await consumer.expiresIn7Days({ userId: 1, expireAt: '2026-07-01' });

    expect(mockNotificationsService.createAndSend).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        type: NotificationType.SUBSCRIPTION_EXPIRES_7_DAYS,
      }),
    );
  });

  it('пропускает уведомление если дубль уже есть', async () => {
    mockNotificationsRepository.existsByTypeAndPeriod.mockResolvedValue(true);

    await consumer.expiresIn7Days({ userId: 1, expireAt: '2026-07-01' });

    expect(mockNotificationsService.createAndSend).not.toHaveBeenCalled();
  });

  it('отправляет payment reminder', async () => {
    mockNotificationsRepository.existsByTypeAndPeriod.mockResolvedValue(false);

    await consumer.paymentReminder({ userId: 2, expireAt: '2026-07-01' });

    expect(mockNotificationsService.createAndSend).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 2,
        type: NotificationType.PAYMENT_REMINDER,
      }),
    );
  });
});
