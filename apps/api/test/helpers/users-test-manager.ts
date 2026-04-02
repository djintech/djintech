import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CreateUserInputDto } from '@src/modules/user-accounts/auth/api/input-dto/users.input-dto';
import { PrismaService } from '@src/db/prisma.service';

export class UsersTestManager {
  constructor(
    private app: INestApplication,
    private prisma: PrismaService,
  ) {}

  async createUser(createModel: CreateUserInputDto) {
    await this.registeredUser(createModel);

    // Получаем confirmationCode из базы данных
    const user = await this.prisma.user.findUnique({
      where: { email: createModel.email },
      include: { emailConfirmation: true },
    });

    const confirmationCode = user?.emailConfirmation?.confirmationCode || '';
    expect(confirmationCode).toBeDefined();

    // Регистрация пользователя
    await request(this.app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({ code: confirmationCode })
      .expect(HttpStatus.NO_CONTENT);
  }

  async registeredUser(createModel: CreateUserInputDto) {
    await request(this.app.getHttpServer())
      .post('/auth/registration')
      .send(createModel)
      .expect(HttpStatus.NO_CONTENT);
  }
}
