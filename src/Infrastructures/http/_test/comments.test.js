const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
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

      // thread
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

      // Arrange
      const requestPayload = {
        judul: 'Dicoding Indonesia berkomentar',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponseJson.data.addedThread.id}/comments`,
        payload: requestPayload,
        headers: { authorization: authorizationHeader },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
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

      // thread
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

      // Arrange
      const requestPayload = {
        content: {},
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponseJson.data.addedThread.id}/comments`,
        payload: requestPayload,
        headers: { authorization: authorizationHeader },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });

    it('should response 201 and persisted comment', async () => {
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

      // thread
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

      // Arrange
      const requestPayload = {
        content: 'Dicoding Indonesia berkomentar',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponseJson.data.addedThread.id}/comments`,
        payload: requestPayload,
        headers: { authorization: authorizationHeader },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.id).toBeDefined();
      expect(responseJson.data.addedComment.id).toContain('comment-');
      expect(responseJson.data.addedComment.content).toBeDefined();
      expect(responseJson.data.addedComment.content).toStrictEqual('Dicoding Indonesia berkomentar');
      expect(responseJson.data.addedComment.owner).toBeDefined();
      expect(responseJson.data.addedComment.owner).toContain('user-');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should successfully delete comment', async () => {
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // add user
      const user1RequestPayload = {
        username: 'dicoding1',
        password: 'secret1',
        fullname: 'Dicoding Indonesia 1',
      };

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: user1RequestPayload,
      });

      const user2RequestPayload = {
        username: 'dicoding2',
        password: 'secret2',
        fullname: 'Dicoding Indonesia 2',
      };

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: user2RequestPayload,
      });

      // auth
      const authentication1RequestPayload = {
        username: 'dicoding1',
        password: 'secret1',
      };

      const authentication1Response = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: authentication1RequestPayload,
      });

      const authentication1ResponseJson = JSON.parse(authentication1Response.payload);
      const authorization1Header = `Bearer ${authentication1ResponseJson.data.accessToken}`;

      const authentication2RequestPayload = {
        username: 'dicoding2',
        password: 'secret2',
      };

      const authentication2Response = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: authentication2RequestPayload,
      });

      const authentication2ResponseJson = JSON.parse(authentication2Response.payload);
      const authorization2Header = `Bearer ${authentication2ResponseJson.data.accessToken}`;

      // thread
      const thread1RequestPayload = {
        title: 'dicoding 1 thread',
        body: 'secret 1',
      };

      const thread1Response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: thread1RequestPayload,
        headers: { authorization: authorization1Header },
      });

      const thread1ResponseJson = JSON.parse(thread1Response.payload);

      // comment
      const request2Payload = {
        content: 'Dicoding Indonesia 2 berkomentar',
      };

      const comment2Response = await server.inject({
        method: 'POST',
        url: `/threads/${thread1ResponseJson.data.addedThread.id}/comments`,
        payload: request2Payload,
        headers: { authorization: authorization2Header },
      });

      const comment2ResponseJson = JSON.parse(comment2Response.payload);

      // Arrange and Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${thread1ResponseJson.data.addedThread.id}/comments/${comment2ResponseJson.data.addedComment.id}`,
        headers: { authorization: authorization2Header },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
