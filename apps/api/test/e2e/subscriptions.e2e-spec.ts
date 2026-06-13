import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { initSettings } from '../helpers/init-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { UsersTestManager } from '../helpers/users-test-manager';
import { PaymentsClientService } from '@src/modules/payments/infrastructure/payments.client';
import { PaymentType, SubscriptionType } from '@libs/contracts/payments/subscription';

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
    jest.restoreAllMocks();
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

  it(`should cancel auto renewal`, async () => {
    const token = await userTestManager.createUserAndLogin();

    jest
      .spyOn(paymentsClient, 'cancelAutoRenewal')
      .mockResolvedValue({
        success: true,
      });

    const response = await request(app.getHttpServer())
      .post(`/subscriptions/canceled-auto-renewal`)
      .auth(token.accessToken, { type: 'bearer' })
      .expect(HttpStatus.NO_CONTENT);
  });

  it(`should return 401 for cancel auto renewal without auth`, async () => {
    await request(app.getHttpServer())
      .post(`/subscriptions/canceled-auto-renewal`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it(`should renew auto renewal`, async () => {
    const token = await userTestManager.createUserAndLogin();

    jest
      .spyOn(paymentsClient, 'renewAutoRenewal')
      .mockResolvedValue({
        success: true,
      });

    const response = await request(app.getHttpServer())
      .post(`/subscriptions/renew-auto-renewal`)
      .auth(token.accessToken, { type: 'bearer' })
      .expect(HttpStatus.NO_CONTENT);
  });

  it(`should return 401 for renew auto renewal without auth`, async () => {
    await request(app.getHttpServer())
      .post(`/subscriptions/renew-auto-renewal`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it(`should return 401 for my payments without auth`, async () => {
    await request(app.getHttpServer())
      .get(`/subscriptions/my-payments`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it(`should return my payments history`, async () => {
    const token = await userTestManager.createUserAndLogin();

    jest.spyOn(paymentsClient, 'getMyPayments').mockResolvedValue({
      totalCount: 1,
      pagesCount: 1,
      page: 1,
      pageSize: 8,
      items: [
        {
          userId: 1,
          subscriptionId: 11,
          startAt: '2026-01-01T00:00:00.000Z',
          expireAt: '2026-02-01T00:00:00.000Z',
          price: 1000,
          subscriptionType: SubscriptionType.MONTHLY,
          paymentType: PaymentType.STRIPE,
        },
      ],
    });

    const response = await request(app.getHttpServer())
      .get(`/subscriptions/my-payments`)
      .auth(token.accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      totalCount: 1,
      pagesCount: 1,
      page: 1,
      pageSize: 8,
      items: [
        {
          userId: expect.any(Number),
          subscriptionId: 11,
          startAt: '2026-01-01T00:00:00.000Z',
          expireAt: '2026-02-01T00:00:00.000Z',
          price: 1000,
          subscriptionType: 'MONTHLY',
          paymentType: 'STRIPE',
        },
      ],
    });
  });

  it(`should pass pagination params to payments service`, async () => {
    const token = await userTestManager.createUserAndLogin();
    const getMyPaymentsSpy = jest.spyOn(paymentsClient, 'getMyPayments').mockResolvedValue({
      totalCount: 3,
      pagesCount: 2,
      page: 2,
      pageSize: 2,
      items: [],
    });

    await request(app.getHttpServer())
      .get(`/subscriptions/my-payments?pageNumber=2&pageSize=2`)
      .auth(token.accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(getMyPaymentsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        pageNumber: 2,
        pageSize: 2,
      }),
    );
  });

  it(`should use default sorting for my payments`, async () => {
    const token = await userTestManager.createUserAndLogin();
    const getMyPaymentsSpy = jest.spyOn(paymentsClient, 'getMyPayments').mockResolvedValue({
      totalCount: 0,
      pagesCount: 0,
      page: 1,
      pageSize: 8,
      items: [],
    });

    await request(app.getHttpServer())
      .get(`/subscriptions/my-payments`)
      .auth(token.accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(getMyPaymentsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        sortBy: 'createdAt',
        sortDirection: 'desc',
      }),
    );
  });

  it(`should pass price sorting to payments service`, async () => {
    const token = await userTestManager.createUserAndLogin();
    const getMyPaymentsSpy = jest.spyOn(paymentsClient, 'getMyPayments').mockResolvedValue({
      totalCount: 0,
      pagesCount: 0,
      page: 1,
      pageSize: 8,
      items: [],
    });

    await request(app.getHttpServer())
      .get(`/subscriptions/my-payments?sortBy=price&sortDirection=asc`)
      .auth(token.accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(getMyPaymentsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        sortBy: 'price',
        sortDirection: 'asc',
      }),
    );
  });

  it(`should pass paymentType sorting to payments service`, async () => {
    const token = await userTestManager.createUserAndLogin();
    const getMyPaymentsSpy = jest.spyOn(paymentsClient, 'getMyPayments').mockResolvedValue({
      totalCount: 0,
      pagesCount: 0,
      page: 1,
      pageSize: 8,
      items: [],
    });

    await request(app.getHttpServer())
      .get(`/subscriptions/my-payments?sortBy=paymentType&sortDirection=desc`)
      .auth(token.accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(getMyPaymentsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        sortBy: 'paymentType',
        sortDirection: 'desc',
      }),
    );
  });

  it(`should return empty payments page`, async () => {
    const token = await userTestManager.createUserAndLogin();

    jest.spyOn(paymentsClient, 'getMyPayments').mockResolvedValue({
      totalCount: 0,
      pagesCount: 0,
      page: 1,
      pageSize: 8,
      items: [],
    });

    const response = await request(app.getHttpServer())
      .get(`/subscriptions/my-payments`)
      .auth(token.accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(response.body.items).toEqual([]);
    expect(response.body.totalCount).toBe(0);
  });

  it(`should return 400 for invalid my payments query params`, async () => {
    const token = await userTestManager.createUserAndLogin();

    await request(app.getHttpServer())
      .get(`/subscriptions/my-payments?sortBy=unknown`)
      .auth(token.accessToken, { type: 'bearer' })
      .expect(HttpStatus.BAD_REQUEST);
  });

  describe('GET /subscriptions/current-payment-subscriptions', () => {
    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get(`/subscriptions/current-payment-subscriptions`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 200 null when no active subscription', async () => {
      const token = await userTestManager.createUserAndLogin();

      jest.spyOn(paymentsClient, 'getCurrentPaymentSubscription').mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get(`/subscriptions/current-payment-subscriptions`)
        .auth(token.accessToken, { type: 'bearer' })
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({});
    });

  //   it('should return current payment subscription when exists', async () => {
  //     const token = await userTestManager.createUserAndLogin();
  //     const prisma = app.get('PrismaService');

  //     const user = await prisma.user.findUnique({ where: { email: 'email1@email.com' } });
  //     expect(user).toBeDefined();

  //     // seed profile
  //     await prisma.profile.create({ data: { userId: user.id, accountType: 'Business' } });

  //     const seededId = 555;

  //     jest.spyOn(paymentsClient, 'getCurrentPaymentSubscription').mockResolvedValue({
  //       subscriptionId: seededId,
  //       expireAt: '2026-01-01T00:00:00.000Z',
  //       autoRenewal: true,
  //       planId: 2,
  //     });

  //     const response = await request(app.getHttpServer())
  //       .get(`/subscriptions/current-payment-subscriptions`)
  //       .auth(token.accessToken, { type: 'bearer' })
  //       .expect(HttpStatus.OK);

  //     expect(response.body).toEqual({
  //       subscriptionId: seededId,
  //       accountType: 'Business',
  //       expireAt: '2026-01-01T00:00:00.000Z',
  //       nextPaymentDate: '2026-01-01T00:00:00.000Z',
  //       autoRenewal: true,
  //       planId: 2,
  //     });
  //   });
   });

});
