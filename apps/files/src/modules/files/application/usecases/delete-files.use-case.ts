import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { S3Service } from "../services/s3.service";
import { DeletedFileResponse } from "@libs/contracts/files/delete-file.contract";

export class DeleteFilesCommand {
  constructor(public readonly keys: string[]) {}
}

@CommandHandler(DeleteFilesCommand)
export class DeleteFilesCommandHandler implements ICommandHandler<DeleteFilesCommand> {
  constructor( private readonly s3: S3Service ) {}

  async execute({ keys }: DeleteFilesCommand): Promise<DeletedFileResponse> {
    return await this.s3.delete( keys );
  }
}