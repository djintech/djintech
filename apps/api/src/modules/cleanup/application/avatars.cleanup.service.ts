import { Injectable } from '@nestjs/common';
import { FilesClientService } from '@src/modules/files/infrastructure/files.client';
import { AvatarsRepository } from '@src/modules/user-accounts/profile/infrastructure/avatars.repository';
import { cleanupImages } from './files-cleanup.util';

@Injectable()
export class AvatarsCleanupService {
  constructor(
    private readonly filesClient: FilesClientService,
    private avatarsRepository: AvatarsRepository,
  ) {}

  async run() {
    const images = await this.avatarsRepository.findImagesForDelete();
    await cleanupImages(images, this.avatarsRepository, this.filesClient);
  }
}