import { Module } from '@nestjs/common';
import { SessionsController } from '@modules/sessions/api/sessions.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { GetUserDevicesUseCase } from '@modules/sessions/application/usecases/get-devices.usecase';
import { DeleteDeviceUseCase } from '@modules/sessions/application/usecases/delete-device.usecase';
import { DeleteAllDevicesUseCase } from '@modules/sessions/application/usecases/delete-other-devices.usecase';
import { UserAccountsModule } from '@modules/user-accounts/user-accounts.module';
import { SessionsRepository } from '@modules/sessions/infrastructure/sessions.repository';

const CommandHandlers = [
  GetUserDevicesUseCase,
  DeleteDeviceUseCase,
  DeleteAllDevicesUseCase,
];
@Module({
  imports: [CqrsModule, UserAccountsModule],
  controllers: [SessionsController],
  providers: [...CommandHandlers, SessionsRepository],
  exports: [],
})
export class SessionsModule {}
