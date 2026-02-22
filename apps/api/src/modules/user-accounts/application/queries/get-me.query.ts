import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { UserContextDto } from "../../dto/user-context.dto";
import { GetMeDto } from "../dto/get-me.dto";
import { AuthQueryRepository } from "../../infrastructure/query/auth.query-repository";
export class GetMeQuery {
  constructor(public dto: UserContextDto) {}
}

@QueryHandler(GetMeQuery)
export class GetMeQueryHandler
  implements IQueryHandler<GetMeQuery, GetMeDto>
{
  constructor(private authQueryRepository: AuthQueryRepository) {}

  async execute({ dto }: GetMeQuery) {
    return this.authQueryRepository.me(dto.id);
  }
}