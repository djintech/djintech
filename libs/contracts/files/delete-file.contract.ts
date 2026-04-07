export class DeleteFileRequest {
  keys!: string[]
}

export class DeletedFileResponse {
  success!: string[];
  failed!: string[];
}
