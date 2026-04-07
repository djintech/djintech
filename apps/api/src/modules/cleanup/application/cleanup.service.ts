import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PostImagesCleanupService } from './post-images.cleanup.service';
import { AvatarsCleanupService } from './avatars.cleanup.service';

@Injectable()
export class CleanupService {
  constructor(
    private postImagesCleanupService: PostImagesCleanupService,
    private readonly avatarsCleanupService: AvatarsCleanupService,
  ) {}

  @Cron('*/10 * * * *')
  async run() {
    await this.postImagesCleanupService.run();
    await this.avatarsCleanupService.run();
  }
}