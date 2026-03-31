import { FilesValidationService } from "@files/modules/files/application/services/files-validation.service";
import { UploadFileRequest } from "@libs/contracts/files/upload-file.contract";

describe('FilesValidationService', () => {
  let service: FilesValidationService;

  const validFile: UploadFileRequest = {
    buffer: Buffer.from('test').toString('base64'),
    mimeType: 'image/png',
    originalName: 'file.png',
    size: 1024,
  };
  
  beforeEach(() => {
    service = new FilesValidationService();
  });

  it('should throw if empty', () => {
    expect(() => service.validateFiles([])).toThrow();
  });

  it('should throw if too many files', () => {
    expect(() =>
      service.validateFiles(new Array(100).fill(validFile)),
    ).toThrow();
  });

  it('should throw if invalid mime', () => {
    expect(() =>
      service.validateFiles([{ ...validFile, mimeType: 'application/pdf' }]),
    ).toThrow();
  });

  it('should pass for valid files', () => {
    expect(() =>
      service.validateFiles([validFile]),
    ).not.toThrow();
  });
});
