import { PATTERN_CREATE_SUBSCRIPTION } from "@libs/constants";
import { Controller } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { MessagePattern } from "@nestjs/microservices";

@Controller()
export class SubscriptionsController {
  constructor( private commandBus: CommandBus, ) {}
  
  @MessagePattern(PATTERN_CREATE_SUBSCRIPTION)
  create(){
    return { success: true}
  }
  //upload(data: UploadFileRequest[]): Promise<UploadFileResponse[]> {
  //  return this.commandBus.execute( new UploadFilesCommand( data ));
  
}
