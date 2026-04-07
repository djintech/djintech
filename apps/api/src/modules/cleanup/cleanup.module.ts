import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanupService } from './application/cleanup.service';
import { PostImagesRepository } from './infrastructure/post-images.repository';
import { AvatarsCleanupService } from './application/avatars.cleanup.service';
import { AvatarsRepository } from '../user-accounts/profile/infrastructure/avatars.repository';
import { PostImagesCleanupService } from './application/post-images.cleanup.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [ 
    CleanupService, 
    PostImagesCleanupService,
    AvatarsCleanupService, 
    PostImagesRepository, 
    AvatarsRepository, 
  ],
})
export class CleanupModule {}
