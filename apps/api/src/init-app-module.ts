import { NestFactory } from '@nestjs/core';
import { DynamicModule } from '@nestjs/common';
import { ApiModule } from './api.module';
import { CoreConfig } from './core/config/core.config';

export async function initAppModule(): Promise<DynamicModule> {
  // из-за того, что нам нужно донастроить динамический AppModule, мы не можем сразу создавать приложение,
  // а создаём сначала контекст
  const appContext = await NestFactory.createApplicationContext(ApiModule);
  const coreConfig = appContext.get<CoreConfig>(CoreConfig);
  await appContext.close();

  return ApiModule.forRoot(coreConfig);
}
