import { Module } from '@nestjs/common';
import { CoreModule } from '@libs/core/core.module';
import { FilesModule } from './modules/files/files.module';
import { UuidModule } from '@libs/utils/src/uuid/uuid.module';
import { configModule } from '@libs/config/config-dynamic-module';
import { ServiceName } from '@libs/config/configuration';

@Module({
  imports: [
    configModule(ServiceName.FILES),
    CoreModule, // 🔝 всегда первым!
    UuidModule,
    FilesModule,    
  ],
  controllers: [],
  providers: [],
})
export class FilesAppModule {}
