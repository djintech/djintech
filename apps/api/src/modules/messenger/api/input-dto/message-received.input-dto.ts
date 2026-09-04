import { IsInt } from 'class-validator';

export class MessageReceivedDto {
  @IsInt()
  id!: number;
}
