import { Injectable } from '@nestjs/common';
import { PostImagesRepository } from '../infrastructure/post-images.repository';
import { FilesClientService } from '@src/modules/files/infrastructure/files.client';
import { cleanupImages } from './files-cleanup.util';

@Injectable()
export class PostImagesCleanupService {
  constructor(
    private postImagesRepository: PostImagesRepository,
    private readonly filesClient: FilesClientService,
  ) {}

  async run() {
    const images = await this.postImagesRepository.findImagesForDelete();
    await cleanupImages(images, this.postImagesRepository, this.filesClient);
  }
}
