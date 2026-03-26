import { Injectable } from "@nestjs/common";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { S3Config } from "../../config/s3.config";

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

  async delete(keys: string[]) {
    await Promise.all(
      keys.map(key =>
        this.client.send(
          new DeleteObjectCommand({
            Bucket: this.config.awsS3Bucket,
            Key: key,
          }),
        ),
      ),
    );
  }
}