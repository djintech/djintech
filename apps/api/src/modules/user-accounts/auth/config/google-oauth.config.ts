import { configValidationUtility } from '@libs/config/setup/config-validation.utility';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsString } from 'class-validator';

@Injectable()
export class GoogleOAuthConfig {
  @IsString({
    message: 'Set Env variable GOOGLE_CLIENT_ID',
  })
  googleClientId: string;
  
  @IsString({
    message: 'Set Env variable GOOGLE_CLIENT_SECRET',
  })
  googleClientSecret: string;
  
  @IsString({
    message: 'Set Env variable GOOGLE_CALLBACK_URL',
  })
  googleCallbackUrl: string;

  constructor(private configService: ConfigService<any, true>) {
    this.googleClientId = this.configService.get('GOOGLE_CLIENT_ID');
    this.googleClientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
    this.googleCallbackUrl = this.configService.get('GOOGLE_CALLBACK_URL');

    configValidationUtility.validateConfig(this);
  }
}
