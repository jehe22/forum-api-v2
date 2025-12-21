const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
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

      // comment
      const commentRequestPayload = {
        content: 'dicoding thread commented',
      };

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponseJson.data.addedThread.id}/comments`,
        payload: commentRequestPayload,
        headers: { authorization: authorizationHeader },
      });

      const commentResponseJson = JSON.parse(commentResponse.payload);

      // Arrange
      const requestPayload = {
        judul: 'Dicoding Indonesia membalas komentar',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponseJson.data.addedThread.id}/comments/${commentResponseJson.data.addedComment.id}/replies`,
        payload: requestPayload,
        headers: { authorization: authorizationHeader },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada');
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

      // comment
      const commentRequestPayload = {
        content: 'dicoding thread commented',
      };

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponseJson.data.addedThread.id}/comments`,
        payload: commentRequestPayload,
        headers: { authorization: authorizationHeader },
      });

      const commentResponseJson = JSON.parse(commentResponse.payload);

      // Arrange
      const requestPayload = {
        content: {},
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponseJson.data.addedThread.id}/comments/${commentResponseJson.data.addedComment.id}/replies`,
        payload: requestPayload,
        headers: { authorization: authorizationHeader },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena tipe data tidak sesuai');
    });

    it('should response 201 and persisted reply', async () => {
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

      // comment
      const commentRequestPayload = {
        content: 'dicoding thread commented',
      };

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponseJson.data.addedThread.id}/comments`,
        payload: commentRequestPayload,
        headers: { authorization: authorizationHeader },
      });

      const commentResponseJson = JSON.parse(commentResponse.payload);

      // Arrange
      const requestPayload = {
        content: 'Dicoding Indonesia membalas komentar',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponseJson.data.addedThread.id}/comments/${commentResponseJson.data.addedComment.id}/replies`,
        payload: requestPayload,
        headers: { authorization: authorizationHeader },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.id).toBeDefined();
      expect(responseJson.data.addedReply.id).toContain('reply-');
      expect(responseJson.data.addedReply.content).toBeDefined();
      expect(responseJson.data.addedReply.content).toStrictEqual('Dicoding Indonesia membalas komentar');
      expect(responseJson.data.addedReply.owner).toBeDefined();
      expect(responseJson.data.addedReply.owner).toContain('user-');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should successfully delete comment', async () => {
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

      // comment
      const commentRequestPayload = {
        content: 'dicoding thread commented',
      };

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponseJson.data.addedThread.id}/comments`,
        payload: commentRequestPayload,
        headers: { authorization: authorizationHeader },
      });

      const commentResponseJson = JSON.parse(commentResponse.payload);

      // reply
      const replyRequestPayload = {
        content: 'Dicoding Indonesia membalas komentar',
      };

      const replyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponseJson.data.addedThread.id}/comments/${commentResponseJson.data.addedComment.id}/replies`,
        payload: replyRequestPayload,
        headers: { authorization: authorizationHeader },
      });

      const replyResponseJson = JSON.parse(replyResponse.payload);

      // Arrange and Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadResponseJson.data.addedThread.id}/comments/${commentResponseJson.data.addedComment.id}/replies/${replyResponseJson.data.addedReply.id}`,
        headers: { authorization: authorizationHeader },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
