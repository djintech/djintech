import { S3Client } from "@aws-sdk/client-s3";
import { S3Service } from "@files/modules/files/application/services/s3.service";
import { S3Config } from "@files/modules/files/config/s3.config";

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: jest.fn(),
    })),
    PutObjectCommand: jest.fn((input) => input),
    DeleteObjectsCommand: jest.fn((input) => input),
  };
});

describe('S3Service', () => {
  let s3Service: S3Service;
  let sendMock: jest.Mock;

  beforeAll(() => {
    sendMock = jest.fn((command) => {
      if (command.Delete) {
        // мок для DeleteObjectsCommand
        return Promise.resolve({
          Deleted: command.Delete.Objects,
          Errors: [],
        });
      }
      // мок для PutObjectCommand
      return Promise.resolve({});
    });
//    sendMock = jest.fn();
    (S3Client as jest.Mock).mockImplementation(() => ({
      send: sendMock,
    }));

    s3Service = new S3Service({
      awsAccessKeyId: 'test-access-key',
      awsSecretAccessKey: 'test-secret-key',
      awsRegion: 'us-east-1',
      awsS3Bucket: 'test-bucket'
    } as unknown as S3Config);  
  });

  beforeEach(() => {
    sendMock.mockClear();
  });

  it('should call PutObjectCommand', async () => {
    await s3Service.upload({
      buffer: Buffer.from('test'),
      key: 'file.png',
      contentType: 'image/png',
    });

    expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({
      Bucket: 'test-bucket',
      Key: 'public/file.png',
      Body: expect.any(Buffer),
      ContentType: 'image/png',
    }));
  });

  it('should call DeleteObjectsCommand', async () => {
    const result = await s3Service.delete(['key1', 'key2']);

    expect(sendMock).toHaveBeenCalledTimes(1); // DeleteObjectsCommand вызывается один раз
    expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({
      Bucket: 'test-bucket',
      Delete: {
        Objects: [{ Key: 'public/key1' }, { Key: 'public/key2' }],
      },
    }));

    expect(result.success).toEqual(['key1', 'key2']);
    expect(result.failed).toEqual([]);
  });
});