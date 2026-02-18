import { BaseCoreConfig } from '@libs/config/base-core.config';
import { configValidationUtility } from '@libs/config/setup/config-validation.utility';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

@Injectable()
export class CoreConfig extends BaseCoreConfig {
  @IsBoolean()
  isSwaggerEnabled: boolean;

  @IsString({
    message: 'Set Env variable CORS_ORIGIN  example: http://localhost:5001',
  })
  corsOrigin: string;

  @IsString({
    message:
      'Set Env variable DATABASE_URL. example: postgresql://user:password@ep-cool-name.eu-central-1.aws.neon.tech/auth_db?sslmode=require',
  })
  databaseUrl: string;

  @IsNumber(
    {},
    {
      message: 'Set Env variable COST_FACTOR. example: 10',
    },
  )
  costFactor: number;

  @IsBoolean({
    message:
      'Set Env variable INCLUDE_TESTING_MODULE to enable/disable Dangerous for production TestingModule, example: true, available values: true, false, 0, 1',
  })
  includeTestingModule: boolean;

  constructor(configService: ConfigService<any, true>) {
    super(configService);

    this.isSwaggerEnabled = configValidationUtility.convertToBoolean(
      configService.get('IS_SWAGGER_ENABLED'),
    ) as boolean;

    this.corsOrigin = configService.get('CORS_ORIGIN');
    this.databaseUrl = configService.get('DATABASE_URL');
    this.costFactor = Number(configService.get('COST_FACTOR'));

    this.includeTestingModule = configValidationUtility.convertToBoolean(
      this.configService.get('INCLUDE_TESTING_MODULE'),
    ) as boolean;

    configValidationUtility.validateConfig(this);
  }
}
