import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';
import { CreateUserDto } from '@modules/user-accounts/application/dto/create-user.dto';
import { EmailService } from '@src/modules/notifications/email.service';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '@src/modules/user-accounts/constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { UserAccountsConfig } from '@src/modules/user-accounts/config/user-accounts.config';
import { UsersTestManager } from './helpers/users-test-manager';

describe('auth', () => {
  let app: INestApplication;
  let userTestManger: UsersTestManager;

  beforeAll(async () => {
    const result = await initSettings(async (moduleBuilder) => {
      return moduleBuilder
        .overrideProvider(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
        .useFactory({
          factory: (userAccountsConfig: UserAccountsConfig) => {
            return new JwtService({
              secret: userAccountsConfig.accessTokenSecret,
              signOptions: { expiresIn: '2s' },
            });
          },
          inject: [UserAccountsConfig],
        });
    });

    app = result.app;
    userTestManger = result.userTestManger;
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  it(`should register user without really send email`, async () => {
    await request(app.getHttpServer())
      .post(`/auth/registration`)
      .send({
        email: 'email@email.com',
        password: 'stringA1',
        username: 'string',
      } as CreateUserDto)
      .expect(HttpStatus.NO_CONTENT);
  });

  it(`should call email sending method while registration`, async () => {
    const sendEmailMethod = (app.get(EmailService).sendConfirmationEmail = jest
      .fn()
      .mockImplementation(() => Promise.resolve()));

    await request(app.getHttpServer())
      .post(`/auth/registration`)
      .send({
        email: 'email@email.com',
        password: 'stringA1',
        username: 'string',
      } as CreateUserDto)
      .expect(HttpStatus.NO_CONTENT);

    expect(sendEmailMethod).toHaveBeenCalled();
  });

  it(`should login user`, async () => {
    const body: CreateUserDto = {
      username: 'username1',
      password: 'username1A',
      email: 'email1@email.com',
    };

    await userTestManger.createUser(body);

    await request(app.getHttpServer())
      .post(`/auth/login`)
      .send({
        email: body.email,
        password: body.password,
      })
      .expect(HttpStatus.OK);
  });

  it(`should not login user, if user not confirmed`, async () => {
    const body: CreateUserDto = {
      username: 'username1',
      password: 'username1A',
      email: 'email@email.com',
    };

    await userTestManger.registeredUser(body);

    await request(app.getHttpServer())
      .post(`/auth/login`)
      .send({
        email: body.email,
        password: body.password,
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });
});
