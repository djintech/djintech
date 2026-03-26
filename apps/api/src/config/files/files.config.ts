import { configValidationUtility } from '@libs/config/setup/config-validation.utility';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@Injectable()
export class FilesConfig {
  @IsString({
    message: 'Set Env variable FILE_SERVICE_HOST, examples: files-mono-service',
  })
  fileServiceHost: string;

  @IsNumber({},
    {
      message: 'Set Env variable FILE_SERVICE_PORT, examples: 4177',
    })
  fileServicePort: number;

  @IsNotEmpty({ message: 'Set Env variable AWS_REGION' })
  awsRegion: string;
  
  @IsNotEmpty({ message: 'Set Env variable AWS_S3_BUCKET' })
  awsS3Bucket: string;

  constructor(private configService: ConfigService<any, true>) {
    this.fileServiceHost = this.configService.get('FILE_SERVICE_HOST');
    this.fileServicePort = Number(this.configService.get('FILE_SERVICE_PORT'));
    this.awsRegion = this.configService.get('AWS_REGION');
    this.awsS3Bucket = this.configService.get('AWS_S3_BUCKET');

    configValidationUtility.validateConfig(this);
  }
}
