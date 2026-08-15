import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationInputDto } from './pagination-input.dto';

export class GetUserFollowersInputDto extends PaginationInputDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  search?: string;
}
