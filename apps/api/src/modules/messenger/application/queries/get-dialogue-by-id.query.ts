import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMessagesParamsDto } from '../../api/input-dto/get-messages.input-dto';
import { MessageQueryRepository } from '../../infrastructure/query/message.query.repository';
import { GetDialogueViewDto } from '../../api/view-dto/get-dialogue.view-dto';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { FileUrlService } from '@src/core/file/file-url.service';

export class GetDialogueByIdQuery {
  constructor(
      public readonly userId: number,
      public readonly dialoguePartnerId: number,
      public readonly query: GetMessagesParamsDto,
  ) {}
}

@QueryHandler(GetDialogueByIdQuery)
export class GetDialogueByIdHandler
  implements IQueryHandler<GetDialogueByIdQuery, GetDialogueViewDto>
{
  constructor(
    private readonly  messageQueryRepository: MessageQueryRepository,
    private readonly fileUrlService: FileUrlService
  ) {}

  async execute({ userId, dialoguePartnerId,query }: GetDialogueByIdQuery): Promise<GetDialogueViewDto> {
    if (userId === dialoguePartnerId) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'You cannot create a dialogue with yourself',
        extensions: [{ message: 'You cannot create a dialogue with yourself', field: 'userId' }],
      });
    }

    const userExists = await this.messageQueryRepository.userExists( dialoguePartnerId );

    if (!userExists) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Dialogue partner not found',
        extensions: [{ message: 'Dialogue partner not found', field: 'dialoguePartnerId' }],
      });
    }

    const { pageSize = 12, cursor = 0 } = query;

    const [ messages, totalCount, notReadCount ] = await Promise.all([
      this.messageQueryRepository.findDialogueMessages( userId, dialoguePartnerId, pageSize, cursor ),
      this.messageQueryRepository.countDialogueMessages( userId, dialoguePartnerId ),
      this.messageQueryRepository.countUnreadMessagesFromPartner( userId, dialoguePartnerId ),
    ]);

    return GetDialogueViewDto.mapDialogueToView( messages, pageSize, totalCount, notReadCount, this.fileUrlService );
  }
}
