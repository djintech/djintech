import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FileUrlService } from '@src/core/file/file-url.service';
import { AvatarsQueryRepository } from '../../infrastructure/query/avatars.query.repository';
import { DomainException } from '@libs/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '@libs/core/exceptions/domain-exception-codes';
import { AvatarViewDto } from '../../api/view-dto/avatar.view-dto';

export class GetAvatarByIdQuery {
  constructor(public id: number) {}
}

@QueryHandler(GetAvatarByIdQuery)
export class GetAvatarByIdQueryHandler implements IQueryHandler<
  GetAvatarByIdQuery,
  AvatarViewDto
> {
  constructor(
    private avatarsQueryRepository: AvatarsQueryRepository,
    private readonly fileUrlService: FileUrlService,
  ) {}

  async execute({ id }: GetAvatarByIdQuery) {
    const avatar = await this.avatarsQueryRepository.findyId(id);

    if (!avatar) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Avatar not found',
        extensions: [{ message: 'Avatar not found', field: 'post' }],
      });
    }

    const buildUrl = this.fileUrlService.getPublicUrl.bind(this.fileUrlService);
    return AvatarViewDto.mapToView(avatar, buildUrl);
  }
}
