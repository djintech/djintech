import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class MessageUpdateDto {
  @IsInt()
  id!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  message!: string;
}
