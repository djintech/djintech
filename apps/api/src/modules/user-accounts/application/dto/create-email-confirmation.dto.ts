export class CreateEmailConfirmationDto {
  userId: number;
  expirationDate: Date;
  confirmationCode: string;
}
