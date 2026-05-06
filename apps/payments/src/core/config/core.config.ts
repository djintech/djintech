import { BaseCoreConfig } from '@libs/config/base-core.config';
import { configValidationUtility } from '@libs/config/setup/config-validation.utility';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsString } from 'class-validator';

@Injectable()
export class CoreConfig {

  @IsString({
    message:
      'Set Env variable STRIPE_SECRET_KEY. example: sk_test_...',
  })
  stripeSecretKey: string;

  @IsString({
    message:
      'Set Env variable STRIPE_WEBHOOK_SECRET. example: whsec_test...',
  })
  stripeWebhookSecret: string;

  @IsString({
    message:
      'Set Env variable FRONTEND_URL. example: https://djintech.org',
  })
  frontendUrl:string;
  
  constructor(private configService: ConfigService<any, true>) {

    this.stripeSecretKey = this.configService.get('STRIPE_SECRET_KEY');
    this.stripeWebhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    this.frontendUrl = this.configService.get('FRONTEND_URL');

    configValidationUtility.validateConfig(this);
  }
}
