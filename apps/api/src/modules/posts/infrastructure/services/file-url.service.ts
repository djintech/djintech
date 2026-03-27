import { Injectable } from "@nestjs/common";
import { FilesConfig } from "@src/config/files/files.config";

@Injectable()
export class FileUrlService {
  constructor(private readonly config: FilesConfig) {}

  getPublicUrl = (path: string): string => {
    return `https://${this.config.awsS3Bucket}.s3.${this.config.awsRegion}.amazonaws.com/public/${path}`;
  };
}
