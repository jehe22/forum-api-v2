const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
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
    await LikesTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 200 and persisted like', async () => {
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

      // Arrange And Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadResponseJson.data.addedThread.id}/comments/${commentResponseJson.data.addedComment.id}/likes`,
        headers: { authorization: authorizationHeader },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
