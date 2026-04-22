import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PlanQueryRepository } from "../../infrastructure/query/plan.query.repository";
import { Plan } from "apps/payments/src/generated/prisma/client";

export class GetPlansQuery {
  constructor() {}
}

@QueryHandler(GetPlansQuery)
export class GetPlansHandler
  implements IQueryHandler<GetPlansQuery, Plan[]>
{
  constructor(
    private readonly planQueryRepository: PlanQueryRepository,
  ) {}

  async execute() {
    return this.planQueryRepository.getAll();
}
}