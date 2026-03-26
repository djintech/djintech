import { Module } from '@nestjs/common';
import { FilesConfig } from './files.config';
import { CoreModule } from '@libs/core/core.module';

@Module({
  imports: [CoreModule],
  providers: [FilesConfig],
  exports: [FilesConfig],
})
export class FilesConfigModule {}
