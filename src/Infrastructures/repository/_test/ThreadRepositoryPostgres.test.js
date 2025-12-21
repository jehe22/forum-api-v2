const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist add thread and return added thread correctly', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-123', username: 'dicoding', password: 'secret_password', fullname: 'Dicoding Indonesia',
      });

      // Arrange
      const addThread = new AddThread({
        title: 'dicoding thread',
        body: 'sttssttt',
      });

      const fakeIdGenerator = () => '234'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      addThread.owner = 'user-123';

      // Action
      await threadRepositoryPostgres.addThread(addThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-234');
      expect(threads).toHaveLength(1);
    });

    it('should return registered thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123', username: 'dicoding', password: 'secret_password', fullname: 'Dicoding Indonesia',
      });

      // Arrange
      const addThread = new AddThread({
        title: 'dicoding thread',
        body: 'this is this',
      });

      const fakeIdGenerator = () => '234'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      addThread.owner = 'user-123';

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThread);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-234',
        title: addThread.title,
        owner: 'user-123',
      }));
    });
  });

  describe('verifyThreadsById function', () => {
    it('should throw NotFoundError when id not available', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123', username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-234', title: 'dicoding', body: 'secret', date: new Date(), owner: 'user-123',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadsById('thread-786')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw InvariantError when username available', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123', username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-234', title: 'dicoding', body: 'secret', date: new Date(), owner: 'user-123',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadsById('thread-234')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getThreadsById function', () => {
    it('should throw NotFoundError when id not available', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123', username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-234', title: 'dicoding', body: 'secret', date: new Date(), owner: 'user-123',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadsById('thread-786')).rejects.toThrowError(NotFoundError);
    });

    it('should return the thread when id available', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123', username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-234', title: 'dicoding', body: 'secret', date: 'Nov 24 2025', owner: 'user-123',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      const getThreads = await threadRepositoryPostgres.getThreadsById('thread-234');

      expect(getThreads).toStrictEqual({
        id: 'thread-234',
        title: 'dicoding',
        body: 'secret',
        date: 'Nov 24 2025',
        owner: 'user-123',
      });
    });
  });
});
