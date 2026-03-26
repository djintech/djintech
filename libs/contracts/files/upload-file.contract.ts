export class UploadFileRequest {
  originalName: string;
  mimeType: string;
  buffer: string; // base64
  size: number;
}

export class UploadFileResponse {
  size: number;
  mimeType: string;
  key: string;
}
