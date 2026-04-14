import { FilesClientService } from '@src/modules/files/infrastructure/files.client';
import { UploadFileResponse } from '@libs/contracts/files/upload-file.contract';
import { DeletedFileResponse } from '@libs/contracts/files/delete-file.contract';

export class FilesClientServiceMock extends FilesClientService {
  uploadMock = jest.fn();
  deleteMock = jest.fn();

  async upload(payload: any[]): Promise<UploadFileResponse[]> {
    return this.uploadMock(payload);
  }

  delete(keys: string[]): Promise<DeletedFileResponse> {
    return this.deleteMock(keys);
  }
}
