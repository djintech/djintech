import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class MessageSendDto {
  @IsInt()
  receiverId!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  message!: string;
}
