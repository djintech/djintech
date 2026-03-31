import { initSettings } from "../helpers/init-settings";
import { CommandBus } from "@nestjs/cqrs";
import { UploadFilesCommand } from "@files/modules/files/application/usecases/upload-files.use-case";
import { DeleteFilesCommand } from "@files/modules/files/application/usecases/delete-files.use-case";
import { INestApplication } from "@nestjs/common";

describe('Files microservice (e2e, no TCP)', () => {
  let app: INestApplication;
  let commandBus: CommandBus;

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;

    // Получаем CommandBus из модуля
    commandBus = result.moduleRef.get(CommandBus);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('should upload files', async () => {
    const payload = [
      {
        buffer: Buffer.from('test').toString('base64'),
        mimeType: 'image/png',
        originalName: 'file.png',
        size: 100,
      },
    ];

    const result = await commandBus.execute(
      new UploadFilesCommand(payload),
    );

    expect(result).toHaveLength(1);
  });

  it('should delete files', async () => {
    const keys = ['key1.png', 'key2.png'];

    const result = await commandBus.execute(
      new DeleteFilesCommand(keys),
    );

    expect(result).toBeUndefined();
  });
});

// import { PATTERN_DELETE_FILES, PATTERN_UPLOAD_FILES } from "@libs/constants";
// import { INestApplication, INestMicroservice } from "@nestjs/common";
// import { ClientProxy} from "@nestjs/microservices";
// import { firstValueFrom } from "rxjs";
// import { initSettings } from "../helpers/init-settings";

// describe('Files microservice (e2e)', () => {
//   let app: INestApplication;
//   let client: ClientProxy;

//   beforeAll(async () => {
//     const result = await initSettings();
//     app = result.app;
//     client = result.client;   
//   });

//   afterAll(async () => {
//     if (client) await client.close();
//     if (app) await app.close();
//   });

//   it('should upload files', async () => {
//     const result = await firstValueFrom(
//       client.send(PATTERN_UPLOAD_FILES, [
//         {
//           buffer: Buffer.from('test').toString('base64'),
//           mimeType: 'image/png',
//           originalName: 'file.png',
//           size: 100,
//         },
//       ]),
//     );

//     expect(result).toHaveLength(1);
//   });

//   it('should delete files', async () => {
//     const keys = ['key1.png', 'key2.png'];

//     const result = await firstValueFrom(
//       client.send(PATTERN_DELETE_FILES, { keys }),
//     );

//     expect(result).toEqual({ success: true });
//   });
// });
