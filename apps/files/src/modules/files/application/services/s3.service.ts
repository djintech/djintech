import { Injectable } from "@nestjs/common";
import { DeleteObjectsCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { S3Config } from "../../config/s3.config";
import { DeletedFileResponse } from "@libs/contracts/files/delete-file.contract";

@Injectable()
export class S3Service {
  private readonly client: S3Client;

  constructor(private readonly config: S3Config) {
    this.client = new S3Client({
      region: config.awsRegion,
      credentials: {
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey,
      },
    });
  }

  async upload(params: {
    buffer: Buffer;
    contentType: string;
    key: string;
  }) {
    const result = await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.awsS3Bucket,
        Key: `public/${params.key}`,
        Body: params.buffer,
        ContentType: params.contentType,
      }),
    );
  }

  async delete(keys: string[]): Promise<DeletedFileResponse> {
    const result = await this.client.send(
      new DeleteObjectsCommand({
        Bucket: this.config.awsS3Bucket,
        Delete: {
          Objects: keys.map(key => ({
            Key: `public/${key}`,
          })),
        },
      }),
    );

    const normalizeKey = (key?: string) => key?.replace('public/', '');

    const success = (result.Deleted ?? [])
      .map(obj => normalizeKey(obj.Key))
      .filter((key): key is string => Boolean(key));

    const failed = (result.Errors ?? [])
      .map(obj => normalizeKey(obj.Key))
      .filter((key): key is string => Boolean(key));

    return { success, failed };
  }
}