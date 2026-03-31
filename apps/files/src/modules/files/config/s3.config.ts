import { Injectable } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { configValidationUtility } from '@libs/config/setup/config-validation.utility';

@Injectable()
export class S3Config {
  @IsNotEmpty({ message: 'Set Env variable AWS_REGION' })
  awsRegion: string;

  @IsNotEmpty({ message: 'Set Env variable AWS_S3_BUCKET' })
  awsS3Bucket: string;

  @IsNotEmpty({ message: 'Set Env variable AWS_ACCESS_KEY_ID' })
  awsAccessKeyId: string;

  @IsNotEmpty({ message: 'Set Env variable AWS_SECRET_ACCESS_KEY' })
  awsSecretAccessKey: string;

  constructor(private configService: ConfigService<any, true>) {
    this.awsRegion = this.configService.get('AWS_REGION');
    this.awsS3Bucket = this.configService.get('AWS_S3_BUCKET');
    this.awsAccessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
    this.awsSecretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');

    configValidationUtility.validateConfig(this);
  }
}
