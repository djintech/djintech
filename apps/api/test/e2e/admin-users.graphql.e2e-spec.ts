import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { initSettings } from '../helpers/init-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { PrismaService } from '@src/db/prisma.service';
import { UsersTestManager } from '../helpers/users-test-manager';

describe('Admin users graphql', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let usersTestManager: UsersTestManager;
  let adminToken: string;

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
    prisma = app.get(PrismaService);
    usersTestManager = new UsersTestManager(app, prisma);
  });

  beforeEach(async () => {
    await deleteAllData(app);

    adminToken = await createAdminAndLogin(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get users list', async () => {
    await usersTestManager.createUser({
      username: 'user123',
      password: 'passwordA1',
      email: 'user1@test.com',
    });

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set(
        'Authorization',
        `Bearer ${adminToken}`,
      )
      .send({
        query: `
          query {
            getUsers {
              totalCount
              items {
                id
                userName
                email
              }
            }
          }
        `,
      })
      .expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getUsers.totalCount).toBe(1);
    expect(response.body.data.getUsers.items[0].email).toBe('user1@test.com');
  });

  it('should get user by id', async () => {
    const user = await prisma.user.create({
      data: {
        username: 'test-user',
        email: 'test@test.com',
        passwordHash: 'hash',

        profile: {
          create: {
            firstName: 'Test',
            lastName: 'User',
            city: 'London',
            country: 'UK',
          },
        },
      },
    });

    const response =
      await request(app.getHttpServer())
      .post('/graphql')
      .set(
        'Authorization',
        `Bearer ${adminToken}`,
      )
      .send({
        query: `
          query($id: Int!) {
            getUser(userId: $id) {
              id
              userName
              email
            }
          }
        `,
        variables: {
          id: user.id,
        },

      })
      .expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getUser.id).toBe(user.id);
  });

  it('should ban user', async () => {
    const user =
      await prisma.user.create({
        data: {
          username: 'ban-user',
          email: 'ban@test.com',
          passwordHash: 'hash',
        },
      });

    const response =
      await request(app.getHttpServer())
      .post('/graphql')
      .set(
        'Authorization',
        `Bearer ${adminToken}`,
      )
      .send({
        query: `
          mutation($input: BanUserInput!) {
            banUser(input: $input)
          }
        `,
        variables:{
          input:{
            userId:user.id,
            banReason:'spam'
          }
        }

      })
      .expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.banUser).toBe(true);

    const updated =
      await prisma.user.findUnique({
        where:{
          id:user.id
        }
      });

    expect(updated?.isBanned).toBe(true);
    expect(updated?.banReason).toBe('spam');
  });

  it('should unban user', async () => {
    const user =
      await prisma.user.create({
        data:{
          username:'blocked',
          email:'blocked@test.com',
          passwordHash:'hash',

          isBanned:true,
          banReason:'spam',
          banDate:new Date(),
        }
      });

    await request(app.getHttpServer())
      .post('/graphql')
      .set(
        'Authorization',
        `Bearer ${adminToken}`,
      )
      .send({
        query:`
          mutation($input:UnbanUserInput!){
            unbanUser(input:$input)
          }
        `,
        variables:{
          input:{
            userId:user.id
          }
        }
      }).expect(200);

    const updated =
      await prisma.user.findUnique({
        where:{
          id:user.id
        }
      });

    expect(updated?.isBanned).toBe(false);
    expect(updated?.banReason).toBeNull();
  });

  it('should remove user', async () => {
    const user =
      await prisma.user.create({
        data:{
          username:'remove-me',
          email:'remove@test.com',
          passwordHash:'hash',
        }
      });

    const response =
      await request(app.getHttpServer())
      .post('/graphql')
      .set(
        'Authorization',
        `Bearer ${adminToken}`,
      )
      .send({
        query:`
          mutation($input:RemoveUserInput!){
            removeUser(input:$input)
          }
        `,
        variables:{
          input:{
            userId:user.id
          }
        }
      }).expect(200);

    expect(response.body.data.removeUser).toBe(true);

    const deleted =
      await prisma.user.findUnique({
        where:{
          id:user.id
        }
      });

    expect(deleted?.deletedAt).not.toBeNull();
  });
});

async function createAdminAndLogin(
  app: INestApplication,
): Promise<string> {
  const response =
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query:`
          mutation {
            login(
              input:{
                email: "admin@gmail.com"
                password: "admin"                
              }
            ){
              accessToken
            }
          }
        `
      });

  return response.body.data.login.accessToken;
}