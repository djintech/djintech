import { PATTERN_DELETE_FILES, PATTERN_UPLOAD_FILES } from "@libs/constants";
import { DeletedFileResponse, DeleteFileRequest } from "@libs/contracts/files/delete-file.contract";
import { UploadFileRequest, UploadFileResponse } from "@libs/contracts/files/upload-file.contract";
import { Controller } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { MessagePattern } from "@nestjs/microservices";
import { UploadFilesCommand } from "../application/usecases/upload-files.use-case";
import { DeleteFilesCommand } from "../application/usecases/delete-files.use-case";

@Controller()
export class FilesController {
  constructor( private commandBus: CommandBus, ) {}
  
  @MessagePattern(PATTERN_UPLOAD_FILES)
  upload(data: UploadFileRequest[]): Promise<UploadFileResponse[]> {
    return this.commandBus.execute( new UploadFilesCommand( data ));
  }

  @MessagePattern(PATTERN_DELETE_FILES)
  delete(data: DeleteFileRequest): Promise<DeletedFileResponse> {
    return this.commandBus.execute(new DeleteFilesCommand( data.keys ));
  }
}
