import { PATTERN_CREATE_SUBSCRIPTION, PATTERN_GET_PLANS } from "@libs/constants";
import { Controller } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { MessagePattern } from "@nestjs/microservices";
import { GetPlansQuery } from "../application/queries/get-plan.query";
import { Plan } from "apps/payments/src/generated/prisma/client";

@Controller()
export class SubscriptionsController {
  constructor( 
    private commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  
  @MessagePattern(PATTERN_CREATE_SUBSCRIPTION)
  create(){
    return { success: true}
  }
  //upload(data: UploadFileRequest[]): Promise<UploadFileResponse[]> {
  //  return this.commandBus.execute( new UploadFilesCommand( data ));
  
  @MessagePattern(PATTERN_GET_PLANS)
  getPlan(): Promise<Plan[]> {
    return this.queryBus.execute(new GetPlansQuery());
  }
}
