//import { configModule } from '@libs/config/config-dynamic-module';
import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';

@Module({
  imports: [
    //configModule,  // 🔝 всегда первым!
  ],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
