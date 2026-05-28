import { IsBoolean, IsNotEmpty, IsNumber } from "class-validator";

export class CancelAutoRenewalRequest {
  @IsNumber()
  @IsNotEmpty()
  userId!: number;
}

export class CancelAutoRenewalResponse {
  @IsBoolean()
  @IsNotEmpty()
  success!: boolean;
}
