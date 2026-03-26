import { S3Client } from "@aws-sdk/client-s3";
import { S3Service } from "@files/modules/files/application/services/s3.service";
import { S3Config } from "@files/modules/files/config/s3.config";

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: jest.fn(),
    })),
    PutObjectCommand: jest.fn((input) => input),
    DeleteObjectCommand: jest.fn((input) => input),
  };
});

describe('S3Service', () => {
  let s3Service: S3Service;
  let sendMock: jest.Mock;

  beforeAll(() => {
    sendMock = jest.fn();
    (S3Client as jest.Mock).mockImplementation(() => ({
      send: sendMock,
    }));

    s3Service = new S3Service({
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test-access-key',
      awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test-secret-key',
      awsRegion: process.env.AWS_REGION || 'us-east-1',
      awsS3Bucket: process.env.AWS_S3_BUCKET || 'test-bucket'
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
      Key: 'file.png',
      Body: expect.any(Buffer),
      ContentType: 'image/png',
    }));
  });

  it('should call DeleteObjectCommand', async () => {
    await s3Service.delete(['key1', 'key2']);

    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({ Key: 'key1' }));
    expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({ Key: 'key2' }));
  });
});