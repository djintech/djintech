import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';
import { CreateUserDto } from '../src/modules/user-accounts/application/dto/create-user.dto';
import { EmailService } from '@src/modules/notifications/email.service';

describe('auth', () => {
  let app: INestApplication;
  //let userTestManger: UsersTestManager;

  beforeAll(async () => {
    const result = await initSettings(async (moduleBuilder) => {
      return moduleBuilder
       // .overrideProvider(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
        // .useFactory({
        //   factory: (configService: ConfigService) => {
        //     return new JwtService({
        //       secret: configService.get('ACCESS_TOKEN_SECRET'),
        //       signOptions: {
        //         expiresIn: configService.get('ACCESS_TOKEN_EXPIRE_IN'),
        //       },
        //     });
        //   },
        //   inject: [ConfigService],
        // })
    });
    
    app = result.app;
   // userTestManger = result.userTestManger;
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
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
});