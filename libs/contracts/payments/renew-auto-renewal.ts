import { IsBoolean, IsNotEmpty, IsNumber } from "class-validator";

export class RenewAutoRenewalRequest {
  @IsNumber()
  @IsNotEmpty()
  userId!: number;
}

export class RenewAutoRenewalResponse {
  @IsBoolean()
  @IsNotEmpty()
  success!: boolean;
}
