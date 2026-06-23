import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationsRepository } from '../../infrastructure/notifications.repository';

@Injectable()
export class NotificationsScheduler {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  @Cron('0 2 * * *')
  async handleCron() {
    const thresholdDate = new Date();
    thresholdDate.setUTCDate(thresholdDate.getUTCDate() - 30);

    await this.notificationsRepository.deleteOlderThan(thresholdDate);
  }
}
