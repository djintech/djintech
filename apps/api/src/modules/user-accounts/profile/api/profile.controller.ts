import { Controller, Delete, HttpCode, HttpStatus, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../auth/guards/bearer/jwt-auth.guard';
import { UserId } from '../../auth/guards/decorators/param/user-id.decorator';
import { AvatarFileInterceptor } from '../interseptors/avatar-file.interceptor';
import { CreateAvatarCommand } from '../application/usecases/create-avatar.usecase';
import { GetAvatarByIdQuery } from '../application/queries/get-avatar-by-id.query';
import { AvatarViewDto } from './view-dto/avatar.view-dto';
import { ApiCreateAvatarDocs } from '../swagger/create-avatar.swagger';
import { DeleteAvatarCommand } from '../application/usecases/delete-avatar.usecase';
import { ApiDeleteAvatarDocs } from '../swagger/delete-avatar.swagger';

@SkipThrottle()
@Controller('users/profile')
export class ProfilesController {
  constructor(
    private commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  
  @Post('avatar')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AvatarFileInterceptor)
  @ApiCreateAvatarDocs()
  async createAvatar(
    @UserId() userId: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AvatarViewDto> {
    const avatarId = await this.commandBus.execute(new CreateAvatarCommand( userId, file ));
    return this.queryBus.execute(new GetAvatarByIdQuery( avatarId ));
  }

  @Delete('avatar')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteAvatarDocs()
  deleteAvatar ( @UserId() userId: number ) {
    return this.commandBus.execute(new DeleteAvatarCommand( userId ));
  }
}
