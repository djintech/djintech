import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationInputDto } from './pagination-input.dto';

export class GetUserFollowingInputDto extends PaginationInputDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  search?: string;
}
