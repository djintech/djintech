import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PostImagesRepository } from '../infrastructure/post-images.repository';
import { FilesClientService } from '@src/modules/files/infrastructure/files.client';

@Injectable()
export class CleanupService {
  constructor(
    private postImagesRepository: PostImagesRepository,
        private readonly filesClient: FilesClientService,
  ) {}

  @Cron('*/10 * * * *')
  async handleCleanup() {
    const images = await this.postImagesRepository.findImagesForDelete();
    
    if (!images.length) {
      //console.log('Cleanup: nothing to delete');
      return;
    };
    
    const keys = images.map(i => i.key);

    try {
      await this.filesClient.delete( keys );

      await this.postImagesRepository.markAsDeleted( images.map(i => i.id) );

    } catch (e) {
      console.error('Cleanup failed', {
        error: e,
        keys,
      });
    }
  }
}