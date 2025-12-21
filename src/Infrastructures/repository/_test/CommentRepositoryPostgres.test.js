const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      // add user
      await UsersTableTestHelper.addUser({
        id: 'user-123', username: 'dicoding', password: 'secret_password', fullname: 'Dicoding Indonesia',
      });

      // add thread
      await ThreadsTableTestHelper.addThread({
        id: 'thread-234', title: 'dicoding thread', body: 'secret', date: new Date(), owner: 'user-123',
      });

      // Arrange
      const addComment = new AddComment({
        content: 'dicoding thread comment',
      });

      const fakeIdGenerator = () => '345';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      addComment.owner = 'user-123';
      addComment.threadId = 'thread-234';

      // Action
      await commentRepositoryPostgres.addComment(addComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById('comment-345');
      expect(comments).toHaveLength(1);
    });

    it('should return registered comment correctly', async () => {
      // add user
      await UsersTableTestHelper.addUser({
        id: 'user-123', username: 'dicoding', password: 'secret_password', fullname: 'Dicoding Indonesia',
      });

      // add thread
      await ThreadsTableTestHelper.addThread({
        id: 'thread-234', title: 'dicoding thread', body: 'secret', date: new Date(), owner: 'user-123',
      });

      // Arrange
      const addComment = new AddComment({
        content: 'dicoding thread comment',
      });

      const fakeIdGenerator = () => '345';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      addComment.owner = 'user-123';
      addComment.threadId = 'thread-234';

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(addComment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-345',
        content: addComment.content,
        owner: 'user-123',
      }));
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return the comment when id available', async () => {
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

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      const getComments = await commentRepositoryPostgres.getCommentsByThreadId('thread-234');

      expect(getComments).toStrictEqual([{
        id: 'comment-345',
        content: 'peter comment on dicoding thread',
        date: '25 Nov 2024',
        owner: 'user-121',
        isdelete: false,
      }]);
    });

    it('should return the empty array when thread does not have any comment', async () => {
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

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      const getComments = await commentRepositoryPostgres.getCommentsByThreadId('thread-234');

      expect(getComments).toStrictEqual([]);
    });

    it('should return isdelete equals true when a comment has been deleted', async () => {
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

      await CommentsTableTestHelper.deleteComment({ id: 'comment-345' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      const getComments = await commentRepositoryPostgres.getCommentsByThreadId('thread-234');

      expect(getComments).toStrictEqual([{
        id: 'comment-345',
        content: 'peter comment on dicoding thread',
        date: '25 Nov 2024',
        owner: 'user-121',
        isdelete: true,
      }]);
    });
  });

  describe('verifyCommentsById function', () => {
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

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      expect(commentRepositoryPostgres.verifyCommentsById('comment-345')).resolves.not.toThrowError(NotFoundError);
    });

    it('should throw not found error when id unavailable', async () => {
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

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      expect(commentRepositoryPostgres.verifyCommentsById('comment-789')).rejects.toThrowError(NotFoundError);
    });

    it('should throw not found error when comment deleted', async () => {
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

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await CommentsTableTestHelper.deleteComment({ id: 'comment-345' });

      expect(commentRepositoryPostgres.verifyCommentsById('comment-345')).rejects.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentsOwner function', () => {
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

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      expect(commentRepositoryPostgres.verifyCommentsOwner({ id: 'comment-345', owner: 'user-121' })).resolves.not.toThrowError(AuthorizationError);
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

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      expect(commentRepositoryPostgres.verifyCommentsOwner({ id: 'comment-345', owner: 'user-123' })).rejects.toThrowError(AuthorizationError);
    });
  });

  describe('deleteCommentsById function', () => {
    it('should delete comments', async () => {
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

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await commentRepositoryPostgres.deleteCommentsById('comment-345');

      const comments = await CommentsTableTestHelper.findCommentsById('comment-345');
      expect(comments).toHaveLength(1);
      expect(comments[0].isdelete).toStrictEqual(true);
    });
  });
});
