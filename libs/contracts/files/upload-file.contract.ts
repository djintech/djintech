export enum UploadType {
  BASE = 'base',
  AVATAR = 'avatar',
}

export class UploadFileRequest {
  originalName!: string;
  mimeType!: string;
  buffer!: string; // base64
  size!: number;
  type?: UploadType;
  userId?: number;
}

export class UploadFileResponse {
  size!: number;
  mimeType!: string;
  key!: string;
}
