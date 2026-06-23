// notifications.scheduler.spec.ts
import { Test } from '@nestjs/testing';
import { NotificationsScheduler } from '@src/modules/notifications/application/schedulers/notifications.scheduler';
import { NotificationsRepository } from '@src/modules/notifications/infrastructure/notifications.repository';

const mockNotificationsRepository = { deleteOlderThan: jest.fn() };

describe('NotificationsScheduler', () => {
  let scheduler: NotificationsScheduler;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        NotificationsScheduler,
        { provide: NotificationsRepository, useValue: mockNotificationsRepository },
      ],
    }).compile();

    scheduler = module.get(NotificationsScheduler);
  });

  it('вызывает deleteOlderThan с датой 30 дней назад', async () => {
    await scheduler.handleCron();

    const [date] = mockNotificationsRepository.deleteOlderThan.mock.calls[0];
    const diff = Date.now() - date.getTime();

    expect(diff).toBeGreaterThanOrEqual(29 * 24 * 60 * 60 * 1000);
    expect(diff).toBeLessThanOrEqual(31 * 24 * 60 * 60 * 1000);
  });
});
