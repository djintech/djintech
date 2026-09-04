import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class MessageSendDto {
  @IsInt()
  @Min(1)
  receiverId!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  message!: string;
}
