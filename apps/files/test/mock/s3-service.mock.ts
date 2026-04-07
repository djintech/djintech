import { S3Service } from "@files/modules/files/application/services/s3.service";
import { DeletedFileResponse } from "@libs/contracts/files/delete-file.contract";

export class S3ServiceMock extends S3Service {
  async upload(params: { buffer: Buffer; contentType: string; key: string; }): Promise<void> {
    console.log('Call mock method S3Service upload');
    return Promise.resolve();
  }

  async delete(keys: string[]): Promise<DeletedFileResponse> {
    return {
      success: keys, // все ключи успешно "удалены"
      failed: [],    // нет ошибок
    };
  }
}
