import { FilesValidationService } from '@files/modules/files/application/services/files-validation.service';
import { UploadFileRequest } from '@libs/contracts/files/upload-file.contract';

describe('FilesValidationService', () => {
  let service: FilesValidationService;

  const pngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64',
  );

  const validFile: UploadFileRequest = {
    buffer: pngBuffer.toString('base64'),
    mimeType: 'image/png',
    originalName: 'file.png',
    size: pngBuffer.length,
  };

  beforeEach(() => {
    service = new FilesValidationService();
  });

  it('should throw if empty', async () => {
    await expect(service.validateFiles([])).rejects.toThrow();
  });

  it('should throw if too many files', async () => {
    await expect(
      service.validateFiles(new Array(100).fill(validFile)),
    ).rejects.toThrow();
  });

  it('should throw if invalid mime', async () => {
    await expect(
      service.validateFiles([
        {
          ...validFile,
          mimeType: 'application/pdf',
        },
      ]),
    ).rejects.toThrow();
  });

  it('should pass for valid PNG', async () => {
    await expect(
      service.validateFiles([validFile]),
    ).resolves.not.toThrow();
  });
});
