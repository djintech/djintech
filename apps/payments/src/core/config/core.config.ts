import { BaseCoreConfig } from '@libs/config/base-core.config';
import { configValidationUtility } from '@libs/config/setup/config-validation.utility';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

@Injectable()
export class CoreConfig extends BaseCoreConfig {

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
  
  constructor(configService: ConfigService<any, true>) {
    super(configService);

    this.stripeSecretKey = configService.get('STRIPE_SECRET_KEY');
    this.stripeWebhookSecret = configService.get('STRIPE_WEBHOOK_SECRET');

    configValidationUtility.validateConfig(this);
  }
}
