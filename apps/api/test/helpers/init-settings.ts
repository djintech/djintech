import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { EmailServiceMock } from '../mock/email-service.mock';
import { deleteAllData } from './delete-all-data';
import { appSetup } from '@src/setup/api.setup';
import { EmailService } from '@src/modules/notifications/email.service';
import { initAppModule } from '@src/init-app-module';
import { CoreConfig } from '@src/core/config/core.config';
import { PrismaService } from '@src/db/prisma.service';
import { UsersTestManager } from './users-test-manager';
import { GoogleRecaptchaService } from '@src/modules/user-accounts/application/services/recaptcha.service';
import { GoogleRecaptchaServiceMock } from '../mock/recaptcha-service.mock';

export const initSettings = async (
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const DynamicAppModule = await initAppModule();

  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [DynamicAppModule],
  })
    .overrideProvider(EmailService)
    .useClass(EmailServiceMock)
    .overrideProvider(GoogleRecaptchaService)
    .useClass(GoogleRecaptchaServiceMock);

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();
  const app = testingAppModule.createNestApplication();
  const coreConfig = app.get<CoreConfig>(CoreConfig);
  appSetup(app, coreConfig.isSwaggerEnabled);

  await app.init();

  const databaseConnection = app.get<PrismaService>(PrismaService);
  const httpServer = app.getHttpServer();
  const userTestManger = new UsersTestManager(app, databaseConnection);

  await deleteAllData(app);

  return {
    app,
    databaseConnection,
    httpServer,
    userTestManger,
  };
};
