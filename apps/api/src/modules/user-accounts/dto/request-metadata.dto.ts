export class RequestMetadataDto {
  constructor(
    public ip: string,
    public deviceName: string,
    public refreshToken?: string,
  ) {}
}
