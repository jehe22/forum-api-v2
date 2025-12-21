const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 400 when request payload not contain needed property', async () => {
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // add user
      const userRequestPayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: userRequestPayload,
      });

      // auth
      const authenticationRequestPayload = {
        username: 'dicoding',
        password: 'secret',
      };

      const authenticationResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: authenticationRequestPayload,
      });

      const authenticationResponseJson = JSON.parse(authenticationResponse.payload);
      const authorizationHeader = `Bearer ${authenticationResponseJson.data.accessToken}`;

      // Arrange
      const requestPayload = {
        title: 'Dicoding Indonesia',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { authorization: authorizationHeader },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // add user
      const userRequestPayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: userRequestPayload,
      });

      // auth
      const authenticationRequestPayload = {
        username: 'dicoding',
        password: 'secret',
      };

      const authenticationResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: authenticationRequestPayload,
      });

      const authenticationResponseJson = JSON.parse(authenticationResponse.payload);
      const authorizationHeader = `Bearer ${authenticationResponseJson.data.accessToken}`;

      // Arrange
      const requestPayload = {
        title: 'dicoding',
        body: {},
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { authorization: authorizationHeader },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('should response 201 and persisted thread', async () => {
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // add user
      const userRequestPayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: userRequestPayload,
      });

      // auth
      const authenticationRequestPayload = {
        username: 'dicoding',
        password: 'secret',
      };

      const authenticationResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: authenticationRequestPayload,
      });

      const authenticationResponseJson = JSON.parse(authenticationResponse.payload);
      const authorizationHeader = `Bearer ${authenticationResponseJson.data.accessToken}`;

      // Arrange
      const requestPayload = {
        title: 'dicoding thread',
        body: 'secret',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { authorization: authorizationHeader },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });
  });

  describe('when GET /threads/{id}', () => {
    it('should response 404 when thread not found', async () => {
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-987',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan di database');
    });

    it('should response 200', async () => {
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // add user
      const userRequestPayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: userRequestPayload,
      });

      // auth
      const authenticationRequestPayload = {
        username: 'dicoding',
        password: 'secret',
      };

      const authenticationResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: authenticationRequestPayload,
      });

      const authenticationResponseJson = JSON.parse(authenticationResponse.payload);
      const authorizationHeader = `Bearer ${authenticationResponseJson.data.accessToken}`;

      const threadRequestPayload = {
        title: 'dicoding thread',
        body: 'secret',
      };

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadRequestPayload,
        headers: { authorization: authorizationHeader },
      });

      const threadResponseJson = JSON.parse(threadResponse.payload);
      const threadId = threadResponseJson.data.addedThread.id;

      const commentRequestPayload = {
        content: 'Dicoding Indonesia berkomentar',
      };

      // Action
      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentRequestPayload,
        headers: { authorization: authorizationHeader },
      });

      // Arrange and Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toBeDefined();
      expect(responseJson.data.thread.id).toContain('thread-');
      expect(responseJson.data.thread.title).toBeDefined();
      expect(responseJson.data.thread.title).toStrictEqual('dicoding thread');
      expect(responseJson.data.thread.body).toBeDefined();
      expect(responseJson.data.thread.body).toStrictEqual('secret');
      expect(responseJson.data.thread.date).toBeDefined();
      expect(responseJson.data.thread.username).toBeDefined();
      expect(responseJson.data.thread.username).toStrictEqual('dicoding');
      expect(responseJson.data.thread.comments).toBeInstanceOf(Array);
      expect(responseJson.data.thread.comments).toHaveLength(1);
      expect(responseJson.data.thread.comments[0].id).toBeDefined();
      expect(responseJson.data.thread.comments[0].id).toContain('comment-');
      expect(responseJson.data.thread.comments[0].content).toBeDefined();
      expect(responseJson.data.thread.comments[0].content).toStrictEqual('Dicoding Indonesia berkomentar');
      expect(responseJson.data.thread.comments[0].date).toBeDefined();
      expect(responseJson.data.thread.comments[0].username).toBeDefined();
      expect(responseJson.data.thread.comments[0].username).toStrictEqual('dicoding');
    });
  });
});
