import { NestFactory } from '@nestjs/core';
import { CoreConfig } from './core/config/core.config';
import { appSetup } from './setup/api.setup';
import cookieParser from 'cookie-parser';
import { initAppModule } from './init-app-module';

async function bootstrap() {
  const DynamicAppModule = await initAppModule();
  const app = await NestFactory.create(DynamicAppModule);
  const coreConfig = app.get<CoreConfig>(CoreConfig);

  app.setGlobalPrefix('api/v1');
  appSetup(app, coreConfig.isSwaggerEnabled); //global settings

  app.use(cookieParser());

  app.enableCors({
    origin: coreConfig.corsOrigin.split(','), //[coreConfig.corsOrigin], // any localhost with any port
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true, // for cookier (example refreshToken)
  });

  const port = coreConfig.port;
  await app.listen(port, () => {
    console.log('App starting listen port: ', port);
    console.log('NODE_ENV: ', coreConfig.env);
  });
}
bootstrap();
