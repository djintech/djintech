import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanupService } from './application/cleanup.service';
import { PostImagesRepository } from './infrastructure/post-images.repository';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [ CleanupService, PostImagesRepository ],
})
export class CleanupModule {}
