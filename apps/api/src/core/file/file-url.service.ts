import { Injectable } from "@nestjs/common";
import { FilesConfig } from "@src/config/files/files.config";

@Injectable()
export class FileUrlService {
  constructor(private readonly config: FilesConfig) {}

  private get baseUrl(): string {
    return `https://${this.config.awsS3Bucket}.s3.${this.config.awsRegion}.amazonaws.com/public`;
  }

  getPublicUrl(path: string): string {
    return `${this.baseUrl}/${path}`;
  }

}
