import { S3Service } from "@files/modules/files/application/services/s3.service";

export class S3ServiceMock extends S3Service {
  async upload(params: { buffer: Buffer; contentType: string; key: string; }): Promise<void> {
    console.log('Call mock method S3Service upload');
    return Promise.resolve();
  }

  async delete(keys: string[]): Promise<void> {
    console.log('Call mock method S3Service delete');
    return Promise.resolve();
  }
}
