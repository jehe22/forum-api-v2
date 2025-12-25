const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddLikeUnlikeComment = require('../../../Domains/likes/entities/AddLikeUnlikeComment');

describe('LikeRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addLike function', () => {
    it('should persist add like', async () => {
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
      const addLike = new AddLikeUnlikeComment();

      const fakeIdGenerator = () => '456';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      addLike.owner = 'user-123';
      addLike.commentId = 'comment-345';

      // Action
      await likeRepositoryPostgres.addLike(addLike);

      // Assert
      const likes = await LikesTableTestHelper.findLikesById('like-456');
      expect(likes).toHaveLength(1);
    });
  });

  describe('getLikeCountsByCommentId function', () => {
    it('should return the count when id available', async () => {
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

      await LikesTableTestHelper.addLike({
        id: 'like-456', owner: 'user-121', likedcomment: 'comment-345',
      });

      await LikesTableTestHelper.addLike({
        id: 'like-457', owner: 'user-123', likedcomment: 'comment-345',
      });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action & Assert
      const likeCounts = await likeRepositoryPostgres.getLikeCountsByCommentId('comment-345');

      expect(likeCounts).toStrictEqual(2);
    });

    it('should return correct counts when a like has been deleted', async () => {
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

      await LikesTableTestHelper.addLike({
        id: 'like-456', owner: 'user-121', likedcomment: 'comment-345',
      });

      await LikesTableTestHelper.deleteLike({
        id: 'like-456', owner: 'user-121', likedcomment: 'comment-345',
      });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action & Assert
      const likeCounts = await likeRepositoryPostgres.getLikeCountsByCommentId('comment-345');

      expect(likeCounts).toStrictEqual(0);
    });
  });

  describe('verifyLikesbyOwnerAndCommentId function', () => {
    it('should pass when likes already available', async () => {
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

      await LikesTableTestHelper.addLike({
        id: 'like-456', owner: 'user-121', likedcomment: 'comment-345',
      });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      const verifyLikesByOwnerAndCommentId = {
        owner: 'user-121',
        commentId: 'comment-345',
      };

      // Action & Assert
      expect(likeRepositoryPostgres.verifyLikesByOwnerAndCommentId(verifyLikesByOwnerAndCommentId))
        .resolves.not.toThrowError(NotFoundError);
    });

    it('should throw not found error when unavaliable', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      const verifyLikesByOwnerAndCommentId = {
        owner: 'user-121',
        commentId: 'comment-345',
      };

      // Action & Assert
      expect(likeRepositoryPostgres.verifyLikesByOwnerAndCommentId(verifyLikesByOwnerAndCommentId))
        .rejects.toThrowError(NotFoundError);
    });
  });

  describe('deleteLike function', () => {
    it('should delete likes', async () => {
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

      await LikesTableTestHelper.addLike({
        id: 'like-456', owner: 'user-121', likedcomment: 'comment-345',
      });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      const deleteLike = {
        owner: 'user-121',
        commentId: 'comment-345',
      };

      // Action & Assert
      await likeRepositoryPostgres.deleteLike(deleteLike);

      const likes = await LikesTableTestHelper.findLikesById('like-456');
      expect(likes).toHaveLength(0);
    });
  });
});
