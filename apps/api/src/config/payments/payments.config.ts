import { configValidationUtility } from '@libs/config/setup/config-validation.utility';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNumber, IsString } from 'class-validator';

@Injectable()
export class PaymentsConfig {
  @IsString({
    message: 'Set Env variable PAYMENTS_SERVICE_HOST, examples: payments-mono-service',
  })
  paymentsServiceHost: string;

  @IsNumber({},
    {
      message: 'Set Env variable PAYMENTS_SERVICE_PORT, examples: 4180',
    })
  paymentsServicePort: number;

  constructor(private configService: ConfigService<any, true>) {
    this.paymentsServiceHost = this.configService.get('PAYMENTS_SERVICE_HOST');
    this.paymentsServicePort = Number(this.configService.get('PAYMENTS_SERVICE_PORT'));

    configValidationUtility.validateConfig(this);
  }
}
