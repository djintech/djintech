import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ProfileViewDto } from "../../api/view-dto/profile.view-dto";
import { ProfileQueryRepository } from "../../infrastructure/query/profile.query.repository";
import { FileUrlService } from "@src/core/file/file-url.service";
import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@libs/core/exceptions/domain-exception-codes";

export class GetProfileQuery {
  constructor( public id: number ) {}
}

@QueryHandler(GetProfileQuery)
export class GetProfileHandler
  implements IQueryHandler<GetProfileQuery, ProfileViewDto>
{
  constructor(
    private profileRepository: ProfileQueryRepository,
    private readonly fileUrlService: FileUrlService
  ) {}

  async execute({ id }: GetProfileQuery) {
    const profile = await this.profileRepository.findyUserId( id );

    if ( !profile ){
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Profile not found',
        extensions: [{ message: 'Profile not found', field: 'userId' }],
      });      
    }

    const buildUrl = this.fileUrlService.getPublicUrl.bind(this.fileUrlService);
    return ProfileViewDto.mapToView( profile, buildUrl );
}
}