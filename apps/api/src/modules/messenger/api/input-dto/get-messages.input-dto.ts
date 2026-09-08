import { BasePaginationInputDto } from "@src/core/dto/base.paginated-with-cursor.view-dto";
import { IsOptional, IsString } from "class-validator";

export class GetMessagesParamsDto extends BasePaginationInputDto {
  @IsOptional()
  @IsString()
  searchName?: string;
}