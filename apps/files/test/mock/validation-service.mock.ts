import { FilesValidationService } from "@files/modules/files/application/services/files-validation.service";
import { UploadFileRequest } from "@libs/contracts/files/upload-file.contract";

export class ValidationMock extends FilesValidationService {
  validateFiles(files: UploadFileRequest[]) {
    console.log('Call mock method FilesValidationService validateFiles');
  }
}
