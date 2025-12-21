const ThreadRepository = require('../ThreadRepository');

describe('ThreadRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const threadRepository = new ThreadRepository();

    // Action and Assert
    await expect(threadRepository.addThread({})).rejects.toThrow(new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED'));

    await expect(threadRepository.verifyThreadsById()).rejects.toThrow(new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED'));

    await expect(threadRepository.getThreadsById()).rejects.toThrow(new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED'));
  });
});
