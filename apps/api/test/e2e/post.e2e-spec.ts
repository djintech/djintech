import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { initSettings } from '../helpers/init-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { UsersTestManager } from '../helpers/users-test-manager';
import { FilesClientService } from '@src/modules/files/infrastructure/files.client';
import { FilesClientServiceMock } from '../mock/files-client-service.mock';
import { PostsQueryRepository } from '@src/modules/posts/infrastructure/query/posts.query.repository';

const mockImage = {
  key: 'img-1',
  url: 'http://test/img-1',
  mimeType: 'image/png',
  size: 123,
};

describe('auth', () => {
  let app: INestApplication;
  let userTestManger: UsersTestManager;
  let filesServiceMock: FilesClientServiceMock;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) => {
      return moduleBuilder
        .overrideProvider(FilesClientService)
        .useClass(FilesClientServiceMock);
    });

    app = result.app;
    userTestManger = result.userTestManger;
    filesServiceMock = app.get(FilesClientService);
  });

  beforeEach(async () => {
    await deleteAllData(app);
    filesServiceMock.uploadMock.mockReset();
    filesServiceMock.deleteMock.mockReset();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  it(`should create post. POST /api/v1/posts. status 200`, async () => {
    filesServiceMock.uploadMock.mockResolvedValue([ mockImage ]);
    const token = await userTestManger.createUserAndLogin();
    const desc = 'test post'
  
    const response = await request( app.getHttpServer() )
      .post(`/posts`)
      .auth(token.accessToken, { type: 'bearer' })
      .field('description', desc)
      .attach('files', Buffer.from('file'), 'file.png')
      .expect(HttpStatus.OK);
    
    expect(response.body.id).toEqual(expect.any(Number));
    expect(response.body.description).toBe(desc);
    expect(response.body.images.length).toBe(1);

    //проверка БД
    const repo = app.get(PostsQueryRepository);
    const post = await repo.findPostById(response.body.id);

    expect(post).toBeTruthy();
    expect(post!.description).toBe(desc);
    expect(post!.postImages.length).toBe(1);
    expect(post!.postImages[0].key).toBe('img-1');
  });

  it(`should create post. No description  POST /api/v1/posts. status 200`, async () => {
    filesServiceMock.uploadMock.mockResolvedValue([ mockImage ]);
    const token = await userTestManger.createUserAndLogin();
  
    const response = await request( app.getHttpServer() )
      .post(`/posts`)
      .auth(token.accessToken, { type: 'bearer' })
      .attach('files', Buffer.from('file'), 'file.png')
    
    expect(response.body.id).toEqual(expect.any(Number));
    expect(response.body.description).toBe(null);
    expect(response.body.images.length).toBe(1);

    //проверка БД
    const repo = app.get(PostsQueryRepository);
    const post = await repo.findPostById(response.body.id);

    expect(post).toBeTruthy();
    expect(post!.description).toBe(null);
    expect(post!.postImages.length).toBe(1);
    expect(post!.postImages[0].key).toBe('img-1');
  });

  it(`should update post description. PUT /api/v1/posts/:id`, async () => {
    filesServiceMock.uploadMock.mockResolvedValue([mockImage]);
    const token = await userTestManger.createUserAndLogin();
    const createResponse = await request(app.getHttpServer())
      .post(`/posts`)
      .auth(token.accessToken, { type: 'bearer' })
      .attach('files', Buffer.from('file'), 'file.png')
      .field('description', 'initial description')
      .expect(HttpStatus.OK);

    const postId = createResponse.body.id;

    await request(app.getHttpServer())
      .put(`/posts/${postId}`)
      .auth(token.accessToken, { type: 'bearer' })
      .send({
        description: 'updated description',
      })
      .expect(HttpStatus.NO_CONTENT);

    const repo = app.get(PostsQueryRepository);
    const post = await repo.findPostById(postId);

    expect(post).toBeTruthy();
    expect(post!.description).toBe('updated description');
  });

  it(`should update post description = null, then 'description', then null PUT /api/v1/posts/:id`, async () => {
    filesServiceMock.uploadMock.mockResolvedValue([mockImage]);
    const token = await userTestManger.createUserAndLogin();
    const createResponse = await request(app.getHttpServer())
      .post(`/posts`)
      .auth(token.accessToken, { type: 'bearer' })
      .attach('files', Buffer.from('file'), 'file.png')
      .field('description', 'initial description')
      .expect(HttpStatus.OK);

    const postId = createResponse.body.id;

    await request(app.getHttpServer())
      .put(`/posts/${postId}`)
      .auth(token.accessToken, { type: 'bearer' })
      .send({})
      .expect(HttpStatus.NO_CONTENT);

    const repo = app.get(PostsQueryRepository);
    let post = await repo.findPostById(postId);
    expect(post!.description).toBeNull();

    //--------
    await request(app.getHttpServer())
      .put(`/posts/${postId}`)
      .auth(token.accessToken, { type: 'bearer' })
      .send({ description: 'description' })
      .expect(HttpStatus.NO_CONTENT);

    post = await repo.findPostById(postId);
    expect(post!.description).toBe('description');

    //--------
    await request(app.getHttpServer())
      .put(`/posts/${postId}`)
      .auth(token.accessToken, { type: 'bearer' })
      .send({ description: null })
      .expect(HttpStatus.NO_CONTENT);

    post = await repo.findPostById(postId);
    expect(post!.description).toBeNull();
  });
});
