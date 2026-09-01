import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { initSettings } from '../helpers/init-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { UsersTestManager } from '../helpers/users-test-manager';
import { PrismaService } from '@src/db/prisma.service';

describe('user follows', () => {
  let app: INestApplication;
  let userTestManager: UsersTestManager;
  let prisma: PrismaService;

  beforeAll(async () => {
    const result = await initSettings();

    app = result.app;
    userTestManager = result.userTestManger;
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  afterEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  afterAll(async () => {
    await app.close();
  });

  /**
   * --------------------------------------------------------------------------
   * Helpers
   * --------------------------------------------------------------------------
   */

  const createUser = async (
    username: string,
    email: string,
  ): Promise<{ id: number; username: string; accessToken: string }> => {
    const password = 'passwordA1';

    await userTestManager.createUser({
      username,
      email,
      password,
    });

    const user = await prisma.user.findUnique({
      where: { email },
    });

    expect(user).not.toBeNull();

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password,
      })
      .expect(HttpStatus.OK);

    return {
      id: user!.id,
      username,
      accessToken: loginResponse.body.accessToken,
    };
  };

  const followUser = (
    accessToken: string,
    selectedUserId: number,
  ) => {
    return request(app.getHttpServer())
      .post('/users/following')
      .auth(accessToken, { type: 'bearer' })
      .send({
        selectedUserId,
      });
  };

  /**
   * --------------------------------------------------------------------------
   * GET /users/:userId
   * User profile
   * --------------------------------------------------------------------------
   */

  it('should get user profile', async () => {
    const currentUser = await createUser(
      'current_user',
      'current_user@email.com',
    );

    const targetUser = await createUser(
      'target_user',
      'target_user@email.com',
    );

    const response = await request(app.getHttpServer())
      .get(`/users/${targetUser.id}`)
      .auth(currentUser.accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: targetUser.id,
        userName: targetUser.username,
        firstName: null,
        lastName: null,
        city: null,
        country: null,
        dateOfBirth: null,
        aboutMe: null,
        avatar: null,
        isFollowing: false,
        isFollowedBy: false,
        followingCount: 0,
        followersCount: 0,
        publicationsCount: 0,
      }),
    );
  });

  it('should return 404 when user profile does not exist', async () => {
    const currentUser = await createUser(
      'current_user',
      'current_user@email.com',
    );

    await request(app.getHttpServer())
      .get('/users/999999')
      .auth(currentUser.accessToken, { type: 'bearer' })
      .expect(HttpStatus.NOT_FOUND);
  });

  /**
   * --------------------------------------------------------------------------
   * POST /users/following
   * Follow
   * --------------------------------------------------------------------------
   */

  it('should follow another user', async () => {
    const currentUser = await createUser(
      'current_user',
      'current_user@email.com',
    );

    const targetUser = await createUser(
      'target_user',
      'target_user@email.com',
    );

    await followUser(
      currentUser.accessToken,
      targetUser.id,
    ).expect(HttpStatus.CREATED);

    const response = await request(app.getHttpServer())
      .get(`/users/${targetUser.id}`)
      .auth(currentUser.accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(response.body.isFollowing).toBe(true);
    expect(response.body.followersCount).toBe(1);
  });

  it('should update profile follow status after following', async () => {
    const currentUser = await createUser(
      'current_user',
      'current_user@email.com',
    );

    const targetUser = await createUser(
      'target_user',
      'target_user@email.com',
    );

    await followUser(
      currentUser.accessToken,
      targetUser.id,
    ).expect(HttpStatus.CREATED);

    const response = await request(app.getHttpServer())
      .get(`/users/${targetUser.id}`)
      .auth(currentUser.accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(response.body.isFollowing).toBe(true);
    expect(response.body.isFollowedBy).toBe(false);
    expect(response.body.followersCount).toBe(1);
  });

  it('should not allow user to follow himself', async () => {
    const currentUser = await createUser(
      'current_user',
      'current_user@email.com',
    );

    await followUser(
      currentUser.accessToken,
      currentUser.id,
    ).expect(HttpStatus.BAD_REQUEST);
  });

  it('should not follow non-existing user', async () => {
    const currentUser = await createUser(
      'current_user',
      'current_user@email.com',
    );

    await followUser(
      currentUser.accessToken,
      999999,
    ).expect(HttpStatus.NOT_FOUND);
  });

  it('should not follow the same user twice', async () => {
    const currentUser = await createUser(
      'current_user',
      'current_user@email.com',
    );

    const targetUser = await createUser(
      'target_user',
      'target_user@email.com',
    );

    await followUser(
      currentUser.accessToken,
      targetUser.id,
    ).expect(HttpStatus.CREATED);

    await followUser(
      currentUser.accessToken,
      targetUser.id,
    ).expect(HttpStatus.BAD_REQUEST);
  });

  /**
   * --------------------------------------------------------------------------
   * DELETE /users/following/:userId
   * Unfollow
   * --------------------------------------------------------------------------
   */

  // it('should unfollow user', async () => {
  //   const currentUser = await createUser(
  //     'current_user',
  //     'current_user@email.com',
  //   );

  //   const targetUser = await createUser(
  //     'target_user',
  //     'target_user@email.com',
  //   );

  //   await followUser(
  //     currentUser.accessToken,
  //     targetUser.id,
  //   ).expect(HttpStatus.CREATED);

  //   await request(app.getHttpServer())
  //     .delete(`/users/following/${targetUser.id}`)
  //     .auth(currentUser.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.NO_CONTENT);

  //   const response = await request(app.getHttpServer())
  //     .get(`/users/${targetUser.id}`)
  //     .auth(currentUser.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.OK);

  //   expect(response.body.isFollowing).toBe(false);
  //   expect(response.body.followersCount).toBe(0);
  // });

  // it('should update profile follow status after unfollowing', async () => {
  //   const currentUser = await createUser(
  //     'current_user',
  //     'current_user@email.com',
  //   );

  //   const targetUser = await createUser(
  //     'target_user',
  //     'target_user@email.com',
  //   );

  //   await followUser(
  //     currentUser.accessToken,
  //     targetUser.id,
  //   ).expect(HttpStatus.CREATED);

  //   await request(app.getHttpServer())
  //     .delete(`/users/following/${targetUser.id}`)
  //     .auth(currentUser.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.NO_CONTENT);

  //   const response = await request(app.getHttpServer())
  //     .get(`/users/${targetUser.id}`)
  //     .auth(currentUser.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.OK);

  //   expect(response.body.isFollowing).toBe(false);
  //   expect(response.body.followersCount).toBe(0);
  // });

  /**
   * --------------------------------------------------------------------------
   * Followers
   * --------------------------------------------------------------------------
   */

  // it('should get followers of user', async () => {
  //   const targetUser = await createUser(
  //     'target_user',
  //     'target_user@email.com',
  //   );

  //   const follower1 = await createUser(
  //     'follower_one',
  //     'follower_one@email.com',
  //   );

  //   const follower2 = await createUser(
  //     'follower_two',
  //     'follower_two@email.com',
  //   );

  //   await followUser(
  //     follower1.accessToken,
  //     targetUser.id,
  //   ).expect(HttpStatus.CREATED);

  //   await followUser(
  //     follower2.accessToken,
  //     targetUser.id,
  //   ).expect(HttpStatus.CREATED);

  //   const response = await request(app.getHttpServer())
  //     .get(`/users/${targetUser.id}/followers`)
  //     .auth(targetUser.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.OK);

  //   expect(response.body.totalCount).toBe(2);
  //   expect(response.body.pageSize).toBe(12);
  //   expect(response.body.items).toHaveLength(2);

  //   expect(response.body.items).toEqual(
  //     expect.arrayContaining([
  //       expect.objectContaining({
  //         userId: follower1.id,
  //         userName: follower1.username,
  //       }),
  //       expect.objectContaining({
  //         userId: follower2.id,
  //         userName: follower2.username,
  //       }),
  //     ]),
  //   );
  // });

  // it('should return empty followers list when user has no followers', async () => {
  //   const targetUser = await createUser(
  //     'target_user',
  //     'target_user@email.com',
  //   );

  //   const response = await request(app.getHttpServer())
  //     .get(`/users/${targetUser.id}/followers`)
  //     .auth(targetUser.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.OK);

  //   expect(response.body.totalCount).toBe(0);
  //   expect(response.body.items).toEqual([]);
  //   expect(response.body.nextCursor).toBeNull();
  // });

  // it('should search followers by username', async () => {
  //   const targetUser = await createUser(
  //     'target_user',
  //     'target_user@email.com',
  //   );

  //   const ivan = await createUser(
  //     'ivan_petrov',
  //     'ivan@email.com',
  //   );

  //   const petr = await createUser(
  //     'petr_sidorov',
  //     'petr@email.com',
  //   );

  //   await followUser(
  //     ivan.accessToken,
  //     targetUser.id,
  //   ).expect(HttpStatus.CREATED);

  //   await followUser(
  //     petr.accessToken,
  //     targetUser.id,
  //   ).expect(HttpStatus.CREATED);

  //   const response = await request(app.getHttpServer())
  //     .get(`/users/${targetUser.id}/followers`)
  //     .query({
  //       search: 'ivan',
  //     })
  //     .auth(targetUser.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.OK);

  //   expect(response.body.totalCount).toBe(1);
  //   expect(response.body.items).toHaveLength(1);
  //   expect(response.body.items[0]).toEqual(
  //     expect.objectContaining({
  //       userId: ivan.id,
  //       userName: ivan.username,
  //     }),
  //   );
  // });

  /**
   * --------------------------------------------------------------------------
   * Following
   * --------------------------------------------------------------------------
   */

  // it('should get following users', async () => {
  //   const currentUser = await createUser(
  //     'current_user',
  //     'current_user@email.com',
  //   );

  //   const targetUser = await createUser(
  //     'target_user',
  //     'target_user@email.com',
  //   );

  //   const following1 = await createUser(
  //     'following_one',
  //     'following_one@email.com',
  //   );

  //   const following2 = await createUser(
  //     'following_two',
  //     'following_two@email.com',
  //   );

  //   await followUser(
  //     targetUser.accessToken,
  //     following1.id,
  //   ).expect(HttpStatus.CREATED);

  //   await followUser(
  //     targetUser.accessToken,
  //     following2.id,
  //   ).expect(HttpStatus.CREATED);

  //   const response = await request(app.getHttpServer())
  //     .get(`/users/${targetUser.id}/following`)
  //     .auth(currentUser.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.OK);

  //   expect(response.body.totalCount).toBe(2);
  //   expect(response.body.pageSize).toBe(12);
  //   expect(response.body.items).toHaveLength(2);

  //   expect(response.body.items).toEqual(
  //     expect.arrayContaining([
  //       expect.objectContaining({
  //         userId: following1.id,
  //         userName: following1.username,
  //       }),
  //       expect.objectContaining({
  //         userId: following2.id,
  //         userName: following2.username,
  //       }),
  //     ]),
  //   );
  // });

  // it('should return empty following list when user follows nobody', async () => {
  //   const currentUser = await createUser(
  //     'current_user',
  //     'current_user@email.com',
  //   );

  //   const targetUser = await createUser(
  //     'target_user',
  //     'target_user@email.com',
  //   );

  //   const response = await request(app.getHttpServer())
  //     .get(`/users/${targetUser.id}/following`)
  //     .auth(currentUser.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.OK);

  //   expect(response.body.totalCount).toBe(0);
  //   expect(response.body.items).toEqual([]);
  //   expect(response.body.nextCursor).toBeNull();
  // });

  // it('should search following users by username', async () => {
  //   const currentUser = await createUser(
  //     'current_user',
  //     'current_user@email.com',
  //   );

  //   const targetUser = await createUser(
  //     'target_user',
  //     'target_user@email.com',
  //   );

  //   const ivan = await createUser(
  //     'ivan_petrov',
  //     'ivan@email.com',
  //   );

  //   const petr = await createUser(
  //     'petr_sidorov',
  //     'petr@email.com',
  //   );

  //   await followUser(
  //     targetUser.accessToken,
  //     ivan.id,
  //   ).expect(HttpStatus.CREATED);

  //   await followUser(
  //     targetUser.accessToken,
  //     petr.id,
  //   ).expect(HttpStatus.CREATED);

  //   const response = await request(app.getHttpServer())
  //     .get(`/users/${targetUser.id}/following`)
  //     .query({
  //       search: 'ivan',
  //     })
  //     .auth(currentUser.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.OK);

  //   expect(response.body.totalCount).toBe(1);
  //   expect(response.body.items).toHaveLength(1);
  //   expect(response.body.items[0]).toEqual(
  //     expect.objectContaining({
  //       userId: ivan.id,
  //       userName: ivan.username,
  //     }),
  //   );
  // });

  /**
   * --------------------------------------------------------------------------
   * isFollowing / isFollowedBy
   * --------------------------------------------------------------------------
   */

  // it('should correctly return isFollowing and isFollowedBy', async () => {
  //   const currentUser = await createUser(
  //     'current_user',
  //     'current_user@email.com',
  //   );

  //   const targetUser = await createUser(
  //     'target_user',
  //     'target_user@email.com',
  //   );

  //   // currentUser -> targetUser
  //   await followUser(
  //     currentUser.accessToken,
  //     targetUser.id,
  //   ).expect(HttpStatus.CREATED);

  //   let response = await request(app.getHttpServer())
  //     .get(`/users/${targetUser.id}`)
  //     .auth(currentUser.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.OK);

  //   expect(response.body.isFollowing).toBe(true);
  //   expect(response.body.isFollowedBy).toBe(false);

  //   // targetUser -> currentUser
  //   await followUser(
  //     targetUser.accessToken,
  //     currentUser.id,
  //   ).expect(HttpStatus.CREATED);

  //   response = await request(app.getHttpServer())
  //     .get(`/users/${targetUser.id}`)
  //     .auth(currentUser.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.OK);

  //   expect(response.body.isFollowing).toBe(true);
  //   expect(response.body.isFollowedBy).toBe(true);
  // });

  /**
   * --------------------------------------------------------------------------
   * Pagination
   * --------------------------------------------------------------------------
   */

  // it('should paginate followers using pageSize', async () => {
  //   const targetUser = await createUser(
  //     'target_user',
  //     'target_user@email.com',
  //   );

  //   for (let i = 1; i <= 5; i++) {
  //     const follower = await createUser(
  //       `follower_${i}`,
  //       `follower_${i}@email.com`,
  //     );

  //     await followUser(
  //       follower.accessToken,
  //       targetUser.id,
  //     ).expect(HttpStatus.CREATED);
  //   }

  //   const response = await request(app.getHttpServer())
  //     .get(`/users/${targetUser.id}/followers`)
  //     .query({
  //       pageSize: 2,
  //     })
  //     .auth(targetUser.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.OK);

  //   expect(response.body.pageSize).toBe(2);
  //   expect(response.body.totalCount).toBe(5);
  //   expect(response.body.items).toHaveLength(2);
  //   expect(response.body.nextCursor).not.toBeNull();
  // });

  // it('should get next followers page using cursor', async () => {
  //   const targetUser = await createUser(
  //     'target_user',
  //     'target_user@email.com',
  //   );

  //   for (let i = 1; i <= 5; i++) {
  //     const follower = await createUser(
  //       `follower_${i}`,
  //       `follower_${i}@email.com`,
  //     );

  //     await followUser(
  //       follower.accessToken,
  //       targetUser.id,
  //     ).expect(HttpStatus.CREATED);
  //   }

  //   const firstPage = await request(app.getHttpServer())
  //     .get(`/users/${targetUser.id}/followers`)
  //     .query({
  //       pageSize: 2,
  //     })
  //     .auth(targetUser.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.OK);

  //   expect(firstPage.body.items).toHaveLength(2);
  //   expect(firstPage.body.nextCursor).not.toBeNull();

  //   const secondPage = await request(app.getHttpServer())
  //     .get(`/users/${targetUser.id}/followers`)
  //     .query({
  //       pageSize: 2,
  //       cursor: firstPage.body.nextCursor,
  //     })
  //     .auth(targetUser.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.OK);

  //   expect(secondPage.body.items).toHaveLength(2);

  //   const firstPageIds = firstPage.body.items.map(
  //     (item: { userId: number }) => item.userId,
  //   );

  //   const secondPageIds = secondPage.body.items.map(
  //     (item: { userId: number }) => item.userId,
  //   );

  //   expect(
  //     secondPageIds.some((id: number) => firstPageIds.includes(id)),
  //   ).toBe(false);
  // });

  // it('should paginate following using pageSize and cursor', async () => {
  //   const currentUser = await createUser(
  //     'current_user',
  //     'current_user@email.com',
  //   );

  //   const targetUser = await createUser(
  //     'target_user',
  //     'target_user@email.com',
  //   );

  //   for (let i = 1; i <= 5; i++) {
  //     const following = await createUser(
  //       `following_${i}`,
  //       `following_${i}@email.com`,
  //     );

  //     await followUser(
  //       targetUser.accessToken,
  //       following.id,
  //     ).expect(HttpStatus.CREATED);
  //   }

  //   const firstPage = await request(app.getHttpServer())
  //     .get(`/users/${targetUser.id}/following`)
  //     .query({
  //       pageSize: 2,
  //     })
  //     .auth(currentUser.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.OK);

  //   expect(firstPage.body.items).toHaveLength(2);
  //   expect(firstPage.body.nextCursor).not.toBeNull();

  //   const secondPage = await request(app.getHttpServer())
  //     .get(`/users/${targetUser.id}/following`)
  //     .query({
  //       pageSize: 2,
  //       cursor: firstPage.body.nextCursor,
  //     })
  //     .auth(currentUser.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.OK);

  //   expect(secondPage.body.items).toHaveLength(2);

  //   const firstPageIds = firstPage.body.items.map(
  //     (item: { userId: number }) => item.userId,
  //   );

  //   const secondPageIds = secondPage.body.items.map(
  //     (item: { userId: number }) => item.userId,
  //   );

  //   expect(
  //     secondPageIds.some((id: number) => firstPageIds.includes(id)),
  //   ).toBe(false);
  // });

  /**
   * --------------------------------------------------------------------------
   * Search users
   * GET /users/search
   * --------------------------------------------------------------------------
   */

  // it('should search users by username', async () => {
  //   const currentUser = await createUser(
  //     'current_user',
  //     'current_user@email.com',
  //   );

  //   const ivan = await createUser(
  //     'ivan_petrov',
  //     'ivan@email.com',
  //   );

  //   await createUser(
  //     'petr_sidorov',
  //     'petr@email.com',
  //   );

  //   const response = await request(app.getHttpServer())
  //     .get('/users/search')
  //     .query({
  //       username: 'ivan',
  //     })
  //     .auth(currentUser.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.OK);

  //   expect(response.body.pageSize).toBe(12);
  //   expect(response.body.items).toHaveLength(1);

  //   expect(response.body.items[0]).toEqual(
  //     expect.objectContaining({
  //       id: ivan.id,
  //       username: ivan.username,
  //       firstName: null,
  //       lastName: null,
  //       avatarUrl: null,
  //     }),
  //   );
  // });

  // it('should search users by partial username', async () => {
  //   const currentUser = await createUser(
  //     'current_user',
  //     'current_user@email.com',
  //   );

  //   const user1 = await createUser(
  //     'ivan_petrov',
  //     'ivan1@email.com',
  //   );

  //   const user2 = await createUser(
  //     'ivan_sidorov',
  //     'ivan2@email.com',
  //   );

  //   await createUser(
  //     'petr_ivanov',
  //     'petr@email.com',
  //   );

  //   const response = await request(app.getHttpServer())
  //     .get('/users/search')
  //     .query({
  //       username: 'ivan',
  //     })
  //     .auth(currentUser.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.OK);

  //   expect(response.body.items).toHaveLength(3);

  //   const ids = response.body.items.map(
  //     (item: { id: number }) => item.id,
  //   );

  //   expect(ids).toEqual(
  //     expect.arrayContaining([
  //       user1.id,
  //       user2.id,
  //     ]),
  //   );
  // });

  // it('should return empty search result when username is not found', async () => {
  //   const currentUser = await createUser(
  //     'current_user',
  //     'current_user@email.com',
  //   );

  //   const response = await request(app.getHttpServer())
  //     .get('/users/search')
  //     .query({
  //       username: 'does_not_exist',
  //     })
  //     .auth(currentUser.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.OK);

  //   expect(response.body.items).toEqual([]);
  //   expect(response.body.nextCursor).toBeNull();
  // });

  // it('should reject search without username', async () => {
  //   const currentUser = await createUser(
  //     'current_user',
  //     'current_user@email.com',
  //   );

  //   await request(app.getHttpServer())
  //     .get('/users/search')
  //     .auth(currentUser.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.BAD_REQUEST);
  // });

  /**
   * --------------------------------------------------------------------------
   * Counters
   * --------------------------------------------------------------------------
   */

  // it('should correctly increment and decrement followers/following counters', async () => {
  //   const user1 = await createUser(
  //     'user_one',
  //     'user_one@email.com',
  //   );

  //   const user2 = await createUser(
  //     'user_two',
  //     'user_two@email.com',
  //   );

  //   let response = await request(app.getHttpServer())
  //     .get(`/users/${user1.id}`)
  //     .auth(user1.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.OK);

  //   expect(response.body.followersCount).toBe(0);
  //   expect(response.body.followingCount).toBe(0);

  //   await followUser(
  //     user1.accessToken,
  //     user2.id,
  //   ).expect(HttpStatus.CREATED);

  //   response = await request(app.getHttpServer())
  //     .get(`/users/${user1.id}`)
  //     .auth(user1.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.OK);

  //   expect(response.body.followingCount).toBe(1);

  //   response = await request(app.getHttpServer())
  //     .get(`/users/${user2.id}`)
  //     .auth(user1.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.OK);

  //   expect(response.body.followersCount).toBe(1);

  //   await request(app.getHttpServer())
  //     .delete(`/users/following/${user2.id}`)
  //     .auth(user1.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.NO_CONTENT);

  //   response = await request(app.getHttpServer())
  //     .get(`/users/${user1.id}`)
  //     .auth(user1.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.OK);

  //   expect(response.body.followingCount).toBe(0);

  //   response = await request(app.getHttpServer())
  //     .get(`/users/${user2.id}`)
  //     .auth(user1.accessToken, { type: 'bearer' })
  //     .expect(HttpStatus.OK);

  //   expect(response.body.followersCount).toBe(0);
  // });
});