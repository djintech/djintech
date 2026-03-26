import { FilesValidationService } from "@files/modules/files/application/services/files-validation.service";
import { S3Service } from "@files/modules/files/application/services/s3.service";
import { UploadFilesCommand, UploadFilesCommandHandler } from "@files/modules/files/application/usecases/upload-files.use-case";
import { UuidService } from "@libs/utils/src/uuid/uuid.service";

describe('UploadFilesCommandHandler', () => {
  let handler: UploadFilesCommandHandler;
  let s3: jest.Mocked<S3Service>;
  let uuid: jest.Mocked<UuidService>;
  let validation: jest.Mocked<FilesValidationService>;

  beforeEach(() => {
    s3 = { upload: jest.fn() } as any;
    uuid = { generate: jest.fn() } as any;
    validation = { validateFiles: jest.fn() } as any;

    handler = new UploadFilesCommandHandler(s3, uuid, validation);
  });

  it('should upload files and return response', async () => {
    uuid.generate.mockReturnValue('uuid-111-222-333-000');

    const dto = [
      {
        buffer: Buffer.from('test').toString('base64'),
        mimeType: 'image/png',
        originalName: 'file.png',
        size: 100,
      },
    ];

    const result = await handler.execute(new UploadFilesCommand(dto));

    expect(validation.validateFiles).toHaveBeenCalledWith(dto);
    expect(s3.upload).toHaveBeenCalledWith({
      buffer: expect.any(Buffer),
      key: 'uuid-111-222-333-000-file.png',
      contentType: 'image/png',
    });

    expect(result).toEqual([
      {
        key: 'uuid-111-222-333-000-file.png',
        mimeType: 'image/png',
        size: 100,
      },
    ]);
  });
});
