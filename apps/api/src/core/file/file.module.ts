import { Global, Module } from "@nestjs/common";
import { FileUrlService } from "./file-url.service";
import { FilesConfig } from "@src/config/files/files.config";

@Global()
@Module({
  providers: [FileUrlService, FilesConfig],
  exports: [FileUrlService],
})
export class FileModule {}
