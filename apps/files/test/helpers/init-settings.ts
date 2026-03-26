import { FilesAppModule } from '@files/files-app.module';
import { FilesValidationService } from '@files/modules/files/application/services/files-validation.service';
import { S3Service } from '@files/modules/files/application/services/s3.service';
import { UuidService } from '@libs/utils/src/uuid/uuid.service';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { S3ServiceMock } from '../mock/s3-service.mock';
import { ValidationMock } from '../mock/validation-service.mock';
import { INestApplication } from '@nestjs/common';

export const initSettings = async (
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  // Мок для UUID
  const uuidMock: Pick<UuidService, 'generate'> = {
    generate: jest.fn().mockReturnValue('11111111-2222-3333-4444-555555555555'),
  };

  // Создаем тестовый модуль
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [FilesAppModule],
  })
    .overrideProvider(S3Service).useClass(S3ServiceMock)
    .overrideProvider(UuidService).useValue(uuidMock)
    .overrideProvider(FilesValidationService).useClass(ValidationMock);

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingModule = await testingModuleBuilder.compile();

  // Создаем обычное приложение (не microservice)
  const app: INestApplication = testingModule.createNestApplication();
  await app.init();

  return {
    app,
    uuidMock,
    moduleRef: testingModule, // пригодится для получения CommandBus и сервисов напрямую
  };
};

// import { FilesAppModule } from '@files/files-app.module';
// import { FilesValidationService } from '@files/modules/files/application/services/files-validation.service';
// import { S3Service } from '@files/modules/files/application/services/s3.service';
// import { UuidService } from '@libs/utils/src/uuid/uuid.service';
// import { Test, TestingModuleBuilder } from '@nestjs/testing';
// import { S3ServiceMock } from '../mock/s3-service.mock';
// import { ValidationMock } from '../mock/validation-service.mock';
// import { ClientOptions, ClientProxy, ClientProxyFactory, MicroserviceOptions, Transport } from '@nestjs/microservices';

// export const initSettings = async (
//   addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
// ) => {
//     const uuidMock: Pick<UuidService, 'generate'> = {
//     generate: jest.fn().mockReturnValue('11111111-2222-3333-4444-555555555555'),
//   };

//   const moduleRef = await Test.createTestingModule({
//     imports: [FilesAppModule],
//   })
//     .overrideProvider(S3Service).useClass(S3ServiceMock)
//     .overrideProvider(UuidService).useValue(uuidMock)
//     .overrideProvider(FilesValidationService).useClass(ValidationMock)
//     .compile();

//     const app = moduleRef.createNestApplication(); 

//     const MICRO_CONFIG: MicroserviceOptions = {
//       transport: Transport.TCP,
//       options: { host: '127.0.0.1', port: 4177 },
//     };

//     app.connectMicroservice(MICRO_CONFIG);

//     await app.startAllMicroservices();
//     await app.init();

//     const client: ClientProxy = ClientProxyFactory.create(MICRO_CONFIG as ClientOptions);
//     await client.connect();
  
//   return {
//     app,
//     client,
//     uuidMock,
//   };
// };
