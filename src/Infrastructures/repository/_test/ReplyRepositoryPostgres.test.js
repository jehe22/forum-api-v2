const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist add reply and return added reply correctly', async () => {
      // add user
      await UsersTableTestHelper.addUser({
        id: 'user-123', username: 'dicoding', password: 'secret_password', fullname: 'Dicoding Indonesia',
      });

      await UsersTableTestHelper.addUser({
        id: 'user-321', username: 'dicodingdua', password: 'secret_password', fullname: 'Dicoding Indonesia Dua',
      });

      // add thread
      await ThreadsTableTestHelper.addThread({
        id: 'thread-234', title: 'dicoding thread', body: 'secret', date: new Date(), owner: 'user-123',
      });

      // add comment
      await CommentsTableTestHelper.addComment({
        id: 'comment-345', content: 'dicoding commentar', date: '28 Des 2023', owner: 'user-321', commentedthread: 'thread-234', isdelete: false,
      });

      // Arrange
      const addReply = new AddReply({
        content: 'dicoding thread comment reply',
      });

      const fakeIdGenerator = () => '456';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      addReply.owner = 'user-123';
      addReply.commentId = 'comment-345';

      // Action
      await replyRepositoryPostgres.addReply(addReply);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-456');
      expect(replies).toHaveLength(1);
    });

    it('should return registered reply correctly', async () => {
      // add user
      await UsersTableTestHelper.addUser({
        id: 'user-123', username: 'dicoding', password: 'secret_password', fullname: 'Dicoding Indonesia',
      });

      await UsersTableTestHelper.addUser({
        id: 'user-321', username: 'dicodingdua', password: 'secret_password', fullname: 'Dicoding Indonesia Dua',
      });

      // add thread
      await ThreadsTableTestHelper.addThread({
        id: 'thread-234', title: 'dicoding thread', body: 'secret', date: new Date(), owner: 'user-123',
      });

      // add comment
      await CommentsTableTestHelper.addComment({
        id: 'comment-345', content: 'dicoding commentar', date: '28 Des 2023', owner: 'user-321', commentedthread: 'thread-234', isdelete: false,
      });

      // Arrange
      const addReply = new AddReply({
        content: 'dicoding thread comment reply',
      });

      const fakeIdGenerator = () => '456';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      addReply.owner = 'user-123';
      addReply.commentId = 'comment-345';

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(addReply);

      // Assert
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-456',
        content: addReply.content,
        owner: addReply.owner,
      }));
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should return the reply when id available', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123', username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia',
      });

      await UsersTableTestHelper.addUser({
        id: 'user-121', username: 'peter', password: 'secret', fullname: 'Peter Moon',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-234', title: 'dicoding', body: 'secret', date: 'Nov 24 2025', owner: 'user-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-345', content: 'peter comment on dicoding thread', date: '25 Nov 2024', owner: 'user-121', commentedthread: 'thread-234', isdelete: false,
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-456', content: 'peter replied on comment on dicoding thread', date: '2 Jan 2025', owner: 'user-121', repliedcomment: 'comment-345', isdelete: false,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      const getReplies = await replyRepositoryPostgres.getRepliesByCommentId('comment-345');

      expect(getReplies).toStrictEqual([{
        id: 'reply-456',
        content: 'peter replied on comment on dicoding thread',
        date: '2 Jan 2025',
        owner: 'user-121',
        isdelete: false,
      }]);
    });

    it('should return the empty array when comment does not have any reply', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123', username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia',
      });

      await UsersTableTestHelper.addUser({
        id: 'user-121', username: 'peter', password: 'secret', fullname: 'Peter Moon',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-234', title: 'dicoding', body: 'secret', date: 'Nov 24 2025', owner: 'user-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-345', content: 'peter comment on dicoding thread', date: '25 Nov 2024', owner: 'user-121', commentedthread: 'thread-234', isdelete: false,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      const getReplies = await replyRepositoryPostgres.getRepliesByCommentId('comment-345');

      expect(getReplies).toStrictEqual([]);
    });

    it('should return isdelete equals true when a reply has been deleted', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123', username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia',
      });

      await UsersTableTestHelper.addUser({
        id: 'user-121', username: 'peter', password: 'secret', fullname: 'Peter Moon',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-234', title: 'dicoding', body: 'secret', date: 'Nov 24 2025', owner: 'user-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-345', content: 'peter comment on dicoding thread', date: '25 Nov 2024', owner: 'user-121', commentedthread: 'thread-234', isdelete: false,
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-456', content: 'peter replied on comment on dicoding thread', date: '2 Jan 2025', owner: 'user-121', repliedcomment: 'comment-345', isdelete: false,
      });

      await RepliesTableTestHelper.deleteReply({ id: 'reply-456' });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      const getReplies = await replyRepositoryPostgres.getRepliesByCommentId('comment-345');

      expect(getReplies).toStrictEqual([{
        id: 'reply-456',
        content: 'peter replied on comment on dicoding thread',
        date: '2 Jan 2025',
        owner: 'user-121',
        isdelete: true,
      }]);
    });
  });

  describe('verifyRepliesById function', () => {
    it('should pass when id available', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123', username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia',
      });

      await UsersTableTestHelper.addUser({
        id: 'user-121', username: 'peter', password: 'secret', fullname: 'Peter Moon',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-234', title: 'dicoding', body: 'secret', date: 'Nov 24 2025', owner: 'user-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-345', content: 'peter comment on dicoding thread', date: '25 Nov 2024', owner: 'user-121', commentedthread: 'thread-234', isdelete: false,
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-456', content: 'peter replied on comment on dicoding thread', date: '2 Jan 2025', owner: 'user-121', repliedcomment: 'comment-345', isdelete: false,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      expect(replyRepositoryPostgres.verifyRepliesById('reply-456')).resolves.not.toThrowError(NotFoundError);
    });

    it('should throw not found error when id unavailable', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      expect(replyRepositoryPostgres.verifyRepliesById('reply-789')).rejects.toThrowError(NotFoundError);
    });

    it('should throw not found error when reply deleted', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123', username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia',
      });

      await UsersTableTestHelper.addUser({
        id: 'user-121', username: 'peter', password: 'secret', fullname: 'Peter Moon',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-234', title: 'dicoding', body: 'secret', date: 'Nov 24 2025', owner: 'user-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-345', content: 'peter comment on dicoding thread', date: '25 Nov 2024', owner: 'user-121', commentedthread: 'thread-234', isdelete: false,
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-456', content: 'peter replied on comment on dicoding thread', date: '2 Jan 2025', owner: 'user-121', repliedcomment: 'comment-345', isdelete: false,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await RepliesTableTestHelper.deleteReply({ id: 'reply-456' });

      expect(replyRepositoryPostgres.verifyRepliesById('reply-456')).rejects.toThrowError(NotFoundError);
    });
  });

  describe('verifyRepliesOwner function', () => {
    it('should pass when the owner correct', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123', username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia',
      });

      await UsersTableTestHelper.addUser({
        id: 'user-121', username: 'peter', password: 'secret', fullname: 'Peter Moon',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-234', title: 'dicoding', body: 'secret', date: 'Nov 24 2025', owner: 'user-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-345', content: 'peter comment on dicoding thread', date: '25 Nov 2024', owner: 'user-121', commentedthread: 'thread-234', isdelete: false,
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-456', content: 'peter replied on comment on dicoding thread', date: '2 Jan 2025', owner: 'user-121', repliedcomment: 'comment-345', isdelete: false,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      expect(replyRepositoryPostgres.verifyRepliesOwner({ id: 'reply-456', owner: 'user-121' })).resolves.not.toThrowError(AuthorizationError);
    });

    it('should throw auth error when owner is not match', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123', username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia',
      });

      await UsersTableTestHelper.addUser({
        id: 'user-121', username: 'peter', password: 'secret', fullname: 'Peter Moon',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-234', title: 'dicoding', body: 'secret', date: 'Nov 24 2025', owner: 'user-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-345', content: 'peter comment on dicoding thread', date: '25 Nov 2024', owner: 'user-121', commentedthread: 'thread-234', isdelete: false,
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-456', content: 'peter replied on comment on dicoding thread', date: '2 Jan 2025', owner: 'user-121', repliedcomment: 'comment-345', isdelete: false,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      expect(replyRepositoryPostgres.verifyRepliesOwner({ id: 'reply-456', owner: 'user-123' })).rejects.toThrowError(AuthorizationError);
    });
  });

  describe('deleteRepliesById function', () => {
    it('should delete replies', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123', username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia',
      });

      await UsersTableTestHelper.addUser({
        id: 'user-121', username: 'peter', password: 'secret', fullname: 'Peter Moon',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-234', title: 'dicoding', body: 'secret', date: 'Nov 24 2025', owner: 'user-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-345', content: 'peter comment on dicoding thread', date: '25 Nov 2024', owner: 'user-121', commentedthread: 'thread-234', isdelete: false,
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-456', content: 'peter replied on comment on dicoding thread', date: '2 Jan 2025', owner: 'user-121', repliedcomment: 'comment-345', isdelete: false,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await replyRepositoryPostgres.deleteRepliesById('reply-456');

      const replies = await RepliesTableTestHelper.findRepliesById('reply-456');
      expect(replies).toHaveLength(1);
      expect(replies[0].isdelete).toStrictEqual(true);
    });
  });
});
