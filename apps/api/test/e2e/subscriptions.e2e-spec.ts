import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { initSettings } from '../helpers/init-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { UsersTestManager } from '../helpers/users-test-manager';
import { PaymentsClientService } from '@src/modules/payments/infrastructure/payments.client';

describe('subscriptions', () => {
  let app: INestApplication;
  let userTestManager: UsersTestManager;
  let paymentsClient: PaymentsClientService;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) => {
      return moduleBuilder;
    });

    app = result.app;
    userTestManager = result.userTestManger;
    paymentsClient = app.get(PaymentsClientService);
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it(`should create subscription and return checkout url`, async () => {
    const token = await userTestManager.createUserAndLogin();

    jest.spyOn(paymentsClient, 'create').mockResolvedValue({
      url: 'https://stripe.com/checkout/test',
    });

    const response = await request(app.getHttpServer())
      .post(`/subscriptions`)
      .auth(token.accessToken, { type: 'bearer' })
      .send({
        planId: 1,
        paymentType: 'STRIPE',
      })
      .expect(HttpStatus.CREATED);

    expect(response.body.url).toBe('https://stripe.com/checkout/test');
  });

  it(`should return 401 if not authorized`, async () => {
    await request(app.getHttpServer())
      .post(`/subscriptions`)
      .send({
        planId: 1,
        paymentType: 'STRIPE',
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it(`should return 400 for invalid input`, async () => {
    const token = await userTestManager.createUserAndLogin();

    await request(app.getHttpServer())
      .post(`/subscriptions`)
      .auth(token.accessToken, { type: 'bearer' })
      .send({
        planId: 'wrong', // ❌
        paymentType: 'STRIPE',
      })
      .expect(HttpStatus.BAD_REQUEST);
  });
});
